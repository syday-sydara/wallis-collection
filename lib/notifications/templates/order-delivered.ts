// PATH: lib/notifications/templates/order-delivered.ts

export function orderDeliveredEmail({ orderId }: { orderId: string }) {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222;">
      <h2 style="margin-bottom: 10px;">Your Order Has Been Delivered</h2>

      <p>Your order <strong>${orderId}</strong> has arrived successfully.</p>

      <p>We hope you absolutely love your items. If you have any questions or need assistance, our team is always here to help.</p>

      <p style="margin-top: 20px;">Thank you for choosing <strong>Wallis Collection</strong>.</p>
    </div>
  `;
}


export function orderDeliveredSMS({ orderId }: { orderId: string }) {
  return `Wallis Collection: Your order ${orderId} has been delivered. Thank you for shopping with us.`;
}


export function orderDeliveredWhatsApp({ orderId }: { orderId: string }) {
  return `
📦 *Wallis Collection – Order Delivered*

Your order *${orderId}* has been delivered successfully.

We hope you enjoy your items. Thank you for shopping with us!
  `;
}
