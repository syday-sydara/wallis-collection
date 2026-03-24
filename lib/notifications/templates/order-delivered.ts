// PATH: lib/notifications/templates/order-delivered.ts

export function orderDeliveredEmail({ orderId }: { orderId: string }) {
  return `
Your order ${orderId} has been delivered!

We hope you love your purchase. If you have any questions or need assistance, we're here to help.

Thank you for choosing Wallis Collection.
  `;
}

export function orderDeliveredSMS({ orderId }: { orderId: string }) {
  return `Wallis Collection: Your order ${orderId} has been delivered. Thank you!`;
}

export function orderDeliveredWhatsApp({ orderId }: { orderId: string }) {
  return `
📬 *Wallis Collection – Order Delivered*

Your order *${orderId}* has been delivered successfully.

We hope you enjoy your items. Thank you for shopping with us!
  `;
}