// lib/whatsapp/receipt.ts

import { sendWhatsAppMessage } from "./send";
import { normalizePhoneForWhatsApp } from "../utils/formatters/phone";
import { emitSecurityEvent } from "@/lib/events/emitter";
import { EventSource } from "@/lib/events/types";

export async function sendWhatsAppReceipt(order: any) {
  const normalized = normalizePhoneForWhatsApp(order.phone) || order.phone;

  await emitSecurityEvent({
    kind: "security",
    type: "WHATSAPP_RECEIPT_GENERATED",
    message: `Receipt generated for order ${order.id}`,
    severity: "low",
    tags: ["whatsapp", "receipt_generated"],
    metadata: {
      orderId: order.id,
      phone: normalized,
      itemCount: order.items?.length ?? 0,
      paymentMethod: order.paymentMethod,
    },
    source: EventSource.WhatsAppAPI,
  });

  const items = (order.items ?? [])
    .map(
      (item: any) =>
        `• ${item.name} x${item.quantity} — ₦${item.unitPrice.toLocaleString()}`
    )
    .join("\n");

  const subtotal = `₦${order.subtotal?.toLocaleString() ?? "0"}`;
  const shipping = `₦${order.shippingCost?.toLocaleString() ?? "0"}`;
  const total = `₦${order.total?.toLocaleString() ?? "0"}`;

  const payment =
    order.paymentMethod === "CASH" ? "Cash on Delivery" : "Paid Online";

  const message = `
🧾 *Order Receipt*
Order #${order.id.slice(0, 8)}
Name: ${order.fullName || "Customer"}
Phone: ${normalized}

📦 *Items*
${items || "No items found"}

💰 *Subtotal:* ${subtotal}
🚚 *Shipping:* ${shipping}
🧮 *Total:* ${total}

💳 *Payment:* ${payment}

📍 *Delivery Notes*
${order.deliveryNotes || "None"}

🔗 *Track your order*
${process.env.NEXT_PUBLIC_APP_URL}/track/${order.trackingToken}
  `.trim();

  const result = await sendWhatsAppMessage(normalized, message);

  if (result?.ok) {
    await emitSecurityEvent({
      kind: "security",
      type: "WHATSAPP_RECEIPT_SENT",
      message: `Receipt sent to ${normalized}`,
      severity: "low",
      tags: ["whatsapp", "receipt_sent"],
      metadata: {
        orderId: order.id,
        phone: normalized,
      },
      source: EventSource.WhatsAppAPI,
    });

    return { ok: true };
  }

  await emitSecurityEvent({
    kind: "security",
    type: "WHATSAPP_RECEIPT_SEND_FAILED",
    message: `Failed to send receipt to ${normalized}`,
    severity: "high",
    tags: ["whatsapp", "receipt_failed"],
    metadata: {
      orderId: order.id,
      phone: normalized,
      error: result?.error,
    },
    source: EventSource.WhatsAppAPI,
  });

  return { ok: false, error: result?.error };
}
