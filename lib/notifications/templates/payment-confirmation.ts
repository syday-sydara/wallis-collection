// PATH: lib/notifications/templates/payment-confirmation.ts
export function paymentConfirmationEmail(orderId: string, total: number) {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222;">
      <h2 style="margin-bottom: 10px;">Payment Confirmed</h2>

      <p>Your payment for <strong>Order ${orderId}</strong> has been received successfully.</p>

      <p><strong>Amount Paid:</strong> ₦${total.toLocaleString()}</p>

      <p>Your order is now being processed. We’ll notify you as soon as it ships.</p>

      <p style="margin-top: 20px;">Thank you for choosing <strong>Wallis Collection</strong>.</p>
    </div>
  `;
}


export function paymentConfirmationSMS(orderId: string, total: number) {
  return `Wallis Collection: Payment confirmed for order ${orderId}. Amount: ₦${total.toLocaleString()}. Thank you for shopping with us.`;
}

export function paymentConfirmationWhatsApp(orderId: string, total: number) {
  return `
🧾 *Wallis Collection – Payment Confirmed*

Your payment for *Order ${orderId}* has been received successfully.

💰 *Amount Paid:* ₦${total.toLocaleString()}

Your order is now being processed. We’ll notify you once it ships.
  `;
}
