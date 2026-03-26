// PATH: lib/notifications/templates/order-shipped.ts

export function orderShippedEmail({
  orderId,
  trackingNumber,
}: {
  orderId: string;
  trackingNumber?: string | null;
}) {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222;">
      <h2 style="margin-bottom: 10px;">Your Order Has Shipped</h2>

      <p>Your order <strong>${orderId}</strong> is now on its way.</p>

      ${
        trackingNumber
          ? `<p>🔍 <strong>Tracking Number:</strong> ${trackingNumber}</p>`
          : `<p>Tracking details will be available soon.</p>`
      }

      <p>We’ll keep you updated as your package moves.</p>

      <p style="margin-top: 20px;">Thank you for shopping with <strong>Wallis Collection</strong>.</p>
    </div>
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
    : `Wallis Collection: Your order ${orderId} has shipped and is on the way.`;
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

Your order *${orderId}* is on its way.

${
  trackingNumber
    ? `🔍 *Tracking Number:* ${trackingNumber}`
    : `Tracking details will be shared soon.`
}

Thank you for shopping with Wallis Collection.
  `;
}
