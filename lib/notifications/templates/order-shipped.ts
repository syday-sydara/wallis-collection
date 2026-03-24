// PATH: lib/notifications/templates/order-shipped.ts

export function orderShippedEmail({
  orderId,
  trackingNumber,
}: {
  orderId: string;
  trackingNumber?: string | null;
}) {
  return `
Your order ${orderId} has been shipped!

📦 Your package is on the way.

${
  trackingNumber
    ? `🔍 Tracking Number: ${trackingNumber}`
    : "Tracking information will be available soon."
}

Thank you for shopping with Wallis Collection.
  `;
}

export function orderShippedSMS({
  orderId,
  trackingNumber,
}: {
  orderId: string;
  trackingNumber?: string | null;
}) {
  return trackingNumber
    ? `Wallis Collection: Your order ${orderId} has shipped. Tracking: ${trackingNumber}.`
    : `Wallis Collection: Your order ${orderId} has shipped.`;
}

export function orderShippedWhatsApp({
  orderId,
  trackingNumber,
}: {
  orderId: string;
  trackingNumber?: string | null;
}) {
  return `
🚚 *Wallis Collection – Order Shipped*

Your order *${orderId}* is on its way!

${
  trackingNumber
    ? `🔍 *Tracking Number:* ${trackingNumber}`
    : "Tracking details will be shared soon."
}

Thank you for shopping with Wallis Collection.
  `;
}