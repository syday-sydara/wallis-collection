// PATH: lib/notifications/templates/payment-confirmation.ts
export function paymentConfirmationEmail(orderId: string, total: number) {
  return `
Your payment for Order ${orderId} has been confirmed.

💰 Total Paid: ₦${total.toLocaleString()}

We’re now processing your order and will notify you once it ships.

Thank you for shopping with Wallis Collection.
  `;
}

export function paymentConfirmationSMS(orderId: string, total: number) {
  return `Wallis Collection: Payment confirmed for order ${orderId}. Amount: ₦${total.toLocaleString()}. Thank you.`;
}

export function paymentConfirmationWhatsApp(orderId: string, total: number) {
  return `
🧾 *Wallis Collection – Payment Confirmed*

Your payment for *Order ${orderId}* has been successfully received.

💰 *Amount Paid:* ₦${total.toLocaleString()}

Your order is now being processed. We’ll notify you once it ships.
  `;
}