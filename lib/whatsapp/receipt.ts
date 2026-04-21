import { sendWhatsAppMessage } from "./send";

export async function sendWhatsAppReceipt(order: any) {
  const items = order.items
    .map(
      (item: any) =>
        `• ${item.name} x${item.quantity} — ₦${item.unitPrice.toLocaleString()}`
    )
    .join("\n");

  const total = `₦${order.total.toLocaleString()}`;
  const subtotal = `₦${order.subtotal.toLocaleString()}`;
  const shipping = `₦${order.shippingCost.toLocaleString()}`;

  const payment =
    order.paymentMethod === "CASH"
      ? "Cash on Delivery"
      : "Paid Online";

  const message = `
🧾 *Order Receipt*
Order #${order.id.slice(0, 8)}
Name: ${order.fullName}
Phone: ${order.phone}

📦 *Items*
${items}

💰 *Subtotal:* ${subtotal}
🚚 *Shipping:* ${shipping}
🧮 *Total:* ${total}

💳 *Payment:* ${payment}

📍 Delivery Notes:
${order.deliveryNotes || "None"}

🔗 Track your order:
${process.env.NEXT_PUBLIC_APP_URL}/track/${order.trackingToken}
  `;

  return sendWhatsAppMessage(order.phone, message);
}
