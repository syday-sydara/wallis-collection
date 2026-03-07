export function orderReceiptTemplate({
  orderId,
  items,
  subtotal,
}: {
  orderId: string;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  subtotal: number;
}) {
  return `
Thank you for your order!

Order Number: ${orderId}

Items:
${items
  .map(
    (item) =>
      `• ${item.name} × ${item.quantity} — ₦${item.price.toLocaleString()}`
  )
  .join("\n")}

Total: ₦${subtotal.toLocaleString()}

We’ll notify you as soon as your order ships.
Thank you for shopping with Wallis Collection.
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
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
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