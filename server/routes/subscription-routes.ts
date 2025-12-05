import { Router, type Request, type Response } from 'express';
import { db } from '../db.js';
import { profiles, users } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';
import { GRADE_SUBSCRIPTION_PLANS } from '../../shared/schema.js';
import { getStripeInstance } from '../utils/payment-gateways.js';
import type { AuthenticatedRequest } from '../types.js';

const router = Router();

// Helper to get subscription plan details
function getPlanDetails(planType: string, billingCycle: 'monthly' | 'yearly') {
  const plans = GRADE_SUBSCRIPTION_PLANS as any;
  const plan = plans[planType];
  
  if (!plan) {
    throw new Error('Invalid subscription tier');
  }
  
  return {
    name: plan.name,
    amount: plan.pricing[billingCycle],
    tier: planType,
    billingCycle,
    features: plan.features
  };
}

// Gateway-agnostic subscription creation
router.post('/subscriptions/create', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { planType, billingCycle = 'monthly', gateway = 'stripe' } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Validate inputs
    if (!['monthly', 'yearly'].includes(billingCycle)) {
      return res.status(400).json({ error: 'Invalid billing cycle' });
    }

    // Get plan details
    const planDetails = getPlanDetails(planType, billingCycle);

    // Get user profile
    const [profile] = await db.select()
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1);

    if (!profile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    // Route to gateway-specific logic
    switch (gateway) {
      case 'stripe': {
        const stripe = await getStripeInstance();
        if (!stripe) {
          return res.status(500).json({ error: 'Stripe not configured' });
        }

        // Get or create Stripe customer
        let customerId = profile.stripeCustomerId;
        
        if (!customerId) {
          const customer = await stripe.customers.create({
            email: user.email,
            name: profile.name || undefined,
          });
          customerId = customer.id;
          
          await db.update(profiles)
            .set({ stripeCustomerId: customerId })
            .where(eq(profiles.userId, userId));
        }

        // Create payment intent (simple approach, not Stripe subscriptions)
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(planDetails.amount * 100),
          currency: 'usd',
          customer: customerId,
          metadata: {
            plan_type: planType,
            billing_cycle: billingCycle,
            user_id: userId,
            subscription: 'true'
          },
          description: `${planDetails.name} - ${billingCycle}`
        });

        return res.json({
          success: true,
          clientSecret: paymentIntent.client_secret,
          gateway: 'stripe',
          amount: planDetails.amount,
          planName: planDetails.name
        });
      }

      case 'paypal': {
        // PayPal flow - return approval URL
        return res.json({
          success: true,
          message: 'PayPal subscription not yet implemented. Use Stripe or contact support.',
          gateway: 'paypal'
        });
      }

      case 'paystack': {
        // Paystack flow - return reference
        return res.json({
          success: true,
          message: 'Paystack subscription not yet implemented. Use Stripe or contact support.',
          gateway: 'paystack'
        });
      }

      default:
        return res.status(400).json({ error: `Gateway ${gateway} not supported` });
    }
  } catch (error: any) {
    console.error('Subscription creation error:', error);
    return res.status(500).json({ error: error.message || 'Failed to create subscription' });
  }
});

// Confirm subscription payment
router.post('/subscriptions/confirm', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { paymentIntentId, planType, amount, gateway = 'stripe' } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    switch (gateway) {
      case 'stripe': {
        const stripe = await getStripeInstance();
        if (!stripe) {
          return res.status(500).json({ error: 'Stripe not configured' });
        }

        // Verify payment intent
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        
        if (paymentIntent.status !== 'succeeded') {
          return res.status(400).json({ error: 'Payment not successful' });
        }

        // Update user profile with subscription
        const planExpiry = new Date();
        planExpiry.setMonth(planExpiry.getMonth() + 1); // 1 month from now (simplified)

        await db.update(profiles)
          .set({ 
            plan: planType,
            subscriptionTier: 'premium',
            planExpiry: planExpiry,
            legacyPlan: planType
          })
          .where(eq(profiles.userId, userId));

        // Generate and send subscription receipt
        try {
          const { ReceiptService } = await import('../services/receipts.js');
          const [profile] = await db.select()
            .from(profiles)
            .where(eq(profiles.userId, userId))
            .limit(1);
          
          const [user] = await db.select()
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);

          if (profile && user) {
            await ReceiptService.generateAndSendSubscriptionReceipt({
              subscriptionId: paymentIntentId,
              userId: userId,
              userEmail: user.email,
              userName: profile.name || undefined,
              planName: planType,
              planType: planType,
              amount: amount || (paymentIntent.amount / 100),
              currency: 'USD',
              billingCycle: 'monthly',
              planExpiry: planExpiry
            });
            console.log('📧 Subscription receipt sent to:', user.email);
          }
        } catch (receiptError) {
          console.error('Failed to send subscription receipt:', receiptError);
        }

        return res.json({
          success: true,
          message: 'Subscription activated successfully',
          planExpiry
        });
      }

      default:
        return res.status(400).json({ error: `Gateway ${gateway} not supported for confirmation` });
    }
  } catch (error: any) {
    console.error('Subscription confirmation error:', error);
    return res.status(500).json({ error: error.message || 'Failed to confirm subscription' });
  }
});

export default router;
