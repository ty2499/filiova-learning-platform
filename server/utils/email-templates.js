import { sendVoucherEmail } from './email.ts';

export async function sendGiftVoucherEmail(recipientEmail, recipientName, buyerName, voucherCode, amount, personalMessage) {
  return sendVoucherEmail({
    recipientEmail,
    recipientName,
    voucherCode,
    amount,
    personalMessage,
    senderName: buyerName || 'Someone special'
  });
}
