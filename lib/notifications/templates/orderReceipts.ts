// PATH: lib/notifications/templates/order-receipt.ts
// NAME: order-receipt.ts

export function orderReceiptTemplate({
  orderId,
  items,
  subtotal,
}: {
  orderId: string;
  items: { name: string; quantity: number; price: number }[];
  subtotal: number;
}) {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222;">
      <h2 style="margin-bottom: 10px;">Order Confirmation</h2>

      <p>Thank you for your order! Your order <strong>${orderId}</strong> has been received successfully.</p>

      <h3 style="margin-top: 20px;">Items</h3>
      <ul style="padding-left: 16px;">
        ${items
          .map(
            (item) =>
              `<li>${item.name} × ${item.quantity} — ₦${item.price.toLocaleString()}</li>`
          )
          .join("")}
      </ul>

      <p style="margin-top: 10px;"><strong>Total:</strong> ₦${subtotal.toLocaleString()}</p>

      <p style="margin-top: 20px;">We’ll notify you as soon as your order ships.</p>

      <p style="margin-top: 20px;">Thank you for choosing <strong>Wallis Collection</strong>.</p>
    </div>
  `;
}


export function orderReceiptSMS({
  orderId,
  subtotal,
}: {
  orderId: string;
  subtotal: number;
}) {
  return `Wallis Collection: Your order ${orderId} is confirmed. Total: ₦${subtotal.toLocaleString()}. Thank you for shopping with us.`;
}


export function orderReceiptWhatsApp({
  orderId,
  items,
  subtotal,
}: {
  orderId: string;
  items: { name: string; quantity: number; price: number }[];
  subtotal: number;
}) {
  return `
🧾 *Wallis Collection – Order Confirmation*

Your order *${orderId}* has been successfully placed.

📦 *Items*
${items
    .map(
      (item) =>
        `• ${item.name} × ${item.quantity} — ₦${item.price.toLocaleString()}`
    )
    .join("\n")}

💰 *Total:* ₦${subtotal.toLocaleString()}

We’ll notify you once your order ships.
Thank you for shopping with Wallis Collection.
  `;
}
