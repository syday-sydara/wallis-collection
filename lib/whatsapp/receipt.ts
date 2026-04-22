// lib/whatsapp/receipt.ts

import { sendWhatsAppMessage } from "./send";
import { normalizePhoneForWhatsApp } from "../utils/formatters/phone";
import { emitSecurityEvent } from "@/lib/events/emitter";

export async function sendWhatsAppReceipt(order: any) {
  const normalized = normalizePhoneForWhatsApp(order.phone) || order.phone;

  /* -------------------------------------------------- */
  /* Log receipt generation                              */
  /* -------------------------------------------------- */
  await emitSecurityEvent({
    type: "WHATSAPP_RECEIPT_GENERATED",
    message: `Receipt generated for order ${order.id}`,
    severity: "low",
    context: "whatsapp",
    operation: "generate",
    category: "whatsapp",
    tags: ["whatsapp", "receipt_generated"],
    metadata: {
      orderId: order.id,
      phone: normalized,
      itemCount: order.items?.length ?? 0,
      paymentMethod: order.paymentMethod,
    },
    source: "whatsapp_api",
  });

  /* -------------------------------------------------- */
  /* Build receipt text                                  */
  /* -------------------------------------------------- */
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
Phone: ${normalized}

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

  /* -------------------------------------------------- */
  /* Send receipt                                        */
  /* -------------------------------------------------- */
  const result = await sendWhatsAppMessage(normalized, message);

  /* -------------------------------------------------- */
  /* Log success/failure                                 */
  /* -------------------------------------------------- */
  if (result?.ok) {
    await emitSecurityEvent({
      type: "WHATSAPP_RECEIPT_SENT",
      message: `Receipt sent to ${normalized}`,
      severity: "low",
      context: "whatsapp",
      operation: "send",
      category: "whatsapp",
      tags: ["whatsapp", "receipt_sent"],
      metadata: {
        orderId: order.id,
        phone: normalized,
      },
      source: "whatsapp_api",
    });
  } else {
    await emitSecurityEvent({
      type: "WHATSAPP_RECEIPT_SEND_FAILED",
      message: `Failed to send receipt to ${normalized}`,
      severity: "high",
      context: "whatsapp",
      operation: "send",
      category: "whatsapp",
      tags: ["whatsapp", "receipt_failed"],
      metadata: {
        orderId: order.id,
        phone: normalized,
        error: result?.error,
      },
      source: "whatsapp_api",
    });
  }

  return result;
}
