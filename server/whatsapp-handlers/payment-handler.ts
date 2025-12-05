import { db } from '../db';
import { 
  users, 
  profiles, 
  giftVoucherPurchases,
  shopCustomers,
  shopMemberships,
  shopTransactions,
  type WhatsAppConversation
} from '@shared/schema';
import { eq } from 'drizzle-orm';
import * as whatsappService from '../whatsapp-service';
import * as chatbot from '../whatsapp-chatbot';
import Stripe from 'stripe';

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-04-30.basil' })
  : null;

function generateVoucherCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'EF';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function createVoucherCheckoutSession(
  userId: string,
  amount: number,
  isGift: boolean,
  recipientEmail?: string,
  recipientName?: string,
  personalMessage?: string
): Promise<{ url: string | null; sessionId: string } | null> {
  if (!stripe) {
    console.error('Stripe not configured');
    return null;
  }

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId)
    });

    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.userId, userId)
    });

    const voucherCode = generateVoucherCode();

    await db.insert(giftVoucherPurchases).values({
      code: voucherCode,
      buyerId: userId,
      buyerEmail: user?.email || profile?.email || '',
      buyerName: profile?.name || '',
      recipientEmail: isGift ? (recipientEmail || '') : (user?.email || profile?.email || ''),
      recipientName: isGift ? (recipientName || '') : (profile?.name || ''),
      amount: amount.toString(),
      personalMessage: personalMessage || null,
      sendToSelf: !isGift,
      paymentMethod: 'stripe',
      paymentStatus: 'pending',
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    });

    const baseUrl = process.env.REPLIT_DEV_DOMAIN 
      ? `https://${process.env.REPLIT_DEV_DOMAIN}`
      : 'https://edufiliova.com';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `EduFiliova Gift Voucher - $${amount}`,
            description: isGift 
              ? `Gift voucher for ${recipientName || recipientEmail}`
              : 'Gift voucher for yourself',
          },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${baseUrl}/voucher/success?code=${voucherCode}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/voucher/cancel`,
      customer_email: user?.email || profile?.email || undefined,
      metadata: {
        type: 'gift_voucher',
        voucherCode,
        buyerId: userId,
        recipientEmail: recipientEmail || '',
        recipientName: recipientName || '',
        isGift: isGift.toString(),
        amount: amount.toString()
      }
    });

    return { url: session.url, sessionId: session.id };
  } catch (error) {
    console.error('Error creating voucher checkout session:', error);
    return null;
  }
}

export async function createMembershipCheckoutSession(
  userId: string,
  plan: 'creator' | 'pro' | 'business',
  billingCycle: 'monthly' | 'yearly' = 'monthly'
): Promise<{ url: string | null; sessionId: string } | null> {
  if (!stripe) {
    console.error('Stripe not configured');
    return null;
  }

  const PLAN_PRICES = {
    creator: { monthly: 999, yearly: 9990, name: 'Creator Plan' },
    pro: { monthly: 2499, yearly: 24990, name: 'Pro Plan' },
    business: { monthly: 4999, yearly: 49990, name: 'Business Plan' }
  };

  const planInfo = PLAN_PRICES[plan];
  if (!planInfo) {
    console.error('Invalid plan:', plan);
    return null;
  }

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId)
    });

    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.userId, userId)
    });

    const baseUrl = process.env.REPLIT_DEV_DOMAIN 
      ? `https://${process.env.REPLIT_DEV_DOMAIN}`
      : 'https://edufiliova.com';

    const price = billingCycle === 'yearly' ? planInfo.yearly : planInfo.monthly;
    const interval = billingCycle === 'yearly' ? 'year' : 'month';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: planInfo.name,
            description: `${billingCycle === 'yearly' ? 'Annual' : 'Monthly'} subscription`,
          },
          unit_amount: price,
          recurring: {
            interval: interval,
          },
        },
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${baseUrl}/membership/success?plan=${plan}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/membership/cancel`,
      customer_email: user?.email || profile?.email || undefined,
      metadata: {
        type: 'membership_upgrade',
        userId,
        plan,
        billingCycle
      }
    });

    return { url: session.url, sessionId: session.id };
  } catch (error) {
    console.error('Error creating membership checkout session:', error);
    return null;
  }
}

export async function handleVoucherPaymentSuccess(
  voucherCode: string,
  sessionId: string
): Promise<boolean> {
  try {
    const voucher = await db.query.giftVoucherPurchases.findFirst({
      where: eq(giftVoucherPurchases.code, voucherCode)
    });

    if (!voucher) {
      console.error('Voucher not found:', voucherCode);
      return false;
    }

    await db.update(giftVoucherPurchases)
      .set({
        paymentStatus: 'completed',
        paymentIntentId: sessionId
      })
      .where(eq(giftVoucherPurchases.code, voucherCode));

    const recipient = voucher.recipientEmail;
    
    if (recipient) {
      const { sendEmail, getEmailTemplate } = await import('../routes');
      
      try {
        await sendEmail(
          recipient,
          'You Received a Gift Voucher from EduFiliova!',
          getEmailTemplate('gift_voucher', {
            recipientName: voucher.recipientName || 'Friend',
            amount: voucher.amount,
            code: voucherCode,
            senderName: voucher.buyerName || 'A Friend',
            message: voucher.personalMessage || 'Enjoy your gift!'
          })
        );

        await db.update(giftVoucherPurchases)
          .set({
            emailSent: true,
            emailSentAt: new Date()
          })
          .where(eq(giftVoucherPurchases.code, voucherCode));
      } catch (emailError) {
        console.error('Failed to send voucher email:', emailError);
      }
    }

    return true;
  } catch (error) {
    console.error('Error handling voucher payment success:', error);
    return false;
  }
}

export async function handleMembershipPaymentSuccess(
  userId: string,
  plan: string,
  sessionId: string
): Promise<boolean> {
  try {
    const customer = await db.query.shopCustomers.findFirst({
      where: eq(shopCustomers.userId, userId)
    });

    if (!customer) {
      console.error('Customer not found for user:', userId);
      return false;
    }

    const existingMembership = await db.query.shopMemberships.findFirst({
      where: eq(shopMemberships.customerId, customer.id)
    });

    const renewalDate = new Date();
    renewalDate.setMonth(renewalDate.getMonth() + 1);

    if (existingMembership) {
      await db.update(shopMemberships)
        .set({
          plan,
          status: 'active',
          renewalDate,
          stripeSubscriptionId: sessionId,
          updatedAt: new Date()
        })
        .where(eq(shopMemberships.id, existingMembership.id));
    } else {
      await db.insert(shopMemberships).values({
        customerId: customer.id,
        plan,
        billingCycle: 'monthly',
        status: 'active',
        renewalDate,
        stripeSubscriptionId: sessionId
      });
    }

    await db.update(shopCustomers)
      .set({
        accountType: plan,
        updatedAt: new Date()
      })
      .where(eq(shopCustomers.id, customer.id));

    await db.update(profiles)
      .set({
        subscriptionTier: plan,
        updatedAt: new Date()
      })
      .where(eq(profiles.userId, userId));

    return true;
  } catch (error) {
    console.error('Error handling membership payment success:', error);
    return false;
  }
}

export async function sendPaymentConfirmationWhatsApp(
  phone: string,
  type: 'voucher' | 'membership',
  details: {
    amount?: string;
    voucherCode?: string;
    recipientEmail?: string;
    plan?: string;
  }
): Promise<void> {
  if (type === 'voucher') {
    await whatsappService.sendTextMessage(
      phone,
      `🎉 Payment Successful!\n\n` +
      `Your voucher has been created:\n` +
      `🎟️ Code: ${details.voucherCode}\n` +
      `💰 Amount: $${details.amount}\n` +
      (details.recipientEmail 
        ? `📧 Sent to: ${details.recipientEmail}`
        : `📧 Added to your account`) +
      `\n\nType MENU to return to the main menu.`
    );
  } else if (type === 'membership') {
    await whatsappService.sendTextMessage(
      phone,
      `🎉 Subscription Activated!\n\n` +
      `You are now on the ${details.plan} plan.\n\n` +
      `Enjoy all your new features!\n\n` +
      `Type MENU to return to the main menu.`
    );
  }
}

export async function handleStripeWebhook(
  event: Stripe.Event
): Promise<{ success: boolean; message: string }> {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const metadata = session.metadata;

      if (metadata?.type === 'gift_voucher') {
        const success = await handleVoucherPaymentSuccess(
          metadata.voucherCode,
          session.id
        );
        return { success, message: success ? 'Voucher processed' : 'Voucher processing failed' };
      }

      if (metadata?.type === 'membership_upgrade') {
        const success = await handleMembershipPaymentSuccess(
          metadata.userId,
          metadata.plan,
          session.id
        );
        return { success, message: success ? 'Membership processed' : 'Membership processing failed' };
      }

      return { success: true, message: 'Event received but not processed' };
    }

    case 'invoice.payment_succeeded': {
      return { success: true, message: 'Invoice payment recorded' };
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      
      const membership = await db.query.shopMemberships.findFirst({
        where: eq(shopMemberships.stripeSubscriptionId, subscription.id)
      });

      if (membership) {
        await db.update(shopMemberships)
          .set({
            status: 'cancelled',
            updatedAt: new Date()
          })
          .where(eq(shopMemberships.id, membership.id));
      }

      return { success: true, message: 'Subscription cancelled' };
    }

    default:
      return { success: true, message: `Unhandled event type: ${event.type}` };
  }
}

export default {
  createVoucherCheckoutSession,
  createMembershipCheckoutSession,
  handleVoucherPaymentSuccess,
  handleMembershipPaymentSuccess,
  sendPaymentConfirmationWhatsApp,
  handleStripeWebhook
};
