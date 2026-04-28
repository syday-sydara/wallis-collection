// lib/whatsapp/rider.ts

import { sendWhatsAppMessage } from "./send";
import { signRiderLink } from "../rider/sign";
import { normalizePhoneForWhatsApp } from "../utils/formatters/phone";
import { emitSecurityEvent } from "@/lib/events/emitter";
import { EventSource } from "@/lib/events/types";

export async function sendRiderLinks(fulfillment: any) {
  const order = fulfillment?.order;
  const orderId = fulfillment?.orderId;

  if (!order || !order.phone) {
    await emitSecurityEvent({
      kind: "security",
      type: "WHATSAPP_RIDER_LINKS_MISSING_ORDER",
      message: `Missing order data for fulfillment ${fulfillment?.id}`,
      severity: "high",
      tags: ["whatsapp", "rider_links", "missing_order"],
      metadata: { fulfillmentId: fulfillment?.id },
      source: EventSource.WhatsAppAPI,
    });

    return { ok: false, error: "missing_order_data" };
  }

  const normalized = normalizePhoneForWhatsApp(order.phone) || order.phone;

  const delivered = signRiderLink(fulfillment.id, "DELIVERED");
  const failed = signRiderLink(fulfillment.id, "FAILED");

  const message = [
    `Rider Update Link for Order #${orderId}`,
    "",
    "Tap one option:",
    "",
    `✔️ Delivered:\n${delivered}`,
    "",
    `❌ Delivery Failed:\n${failed}`,
  ].join("\n");

  await emitSecurityEvent({
    kind: "security",
    type: "WHATSAPP_RIDER_LINKS_GENERATED",
    message: `Generated rider update links for fulfillment ${fulfillment.id}`,
    severity: "medium",
    tags: ["whatsapp", "rider_links", "generated"],
    metadata: {
      fulfillmentId: fulfillment.id,
      orderId,
      phone: normalized,
    },
    source: EventSource.WhatsAppAPI,
  });

  const result = await sendWhatsAppMessage(normalized, message);

  if (result?.ok) {
    await emitSecurityEvent({
      kind: "security",
      type: "WHATSAPP_RIDER_LINKS_SENT",
      message: `Rider update links sent to ${normalized}`,
      severity: "low",
      tags: ["whatsapp", "rider_links", "sent"],
      metadata: {
        fulfillmentId: fulfillment.id,
        orderId,
        phone: normalized,
      },
      source: EventSource.WhatsAppAPI,
    });

    return { ok: true };
  }

  await emitSecurityEvent({
    kind: "security",
    type: "WHATSAPP_RIDER_LINKS_SEND_FAILED",
    message: `Failed to send rider update links to ${normalized}`,
    severity: "high",
    tags: ["whatsapp", "rider_links", "failed"],
    metadata: {
      fulfillmentId: fulfillment.id,
      orderId,
      phone: normalized,
      error: result?.error,
    },
    source: EventSource.WhatsAppAPI,
  });

  return { ok: false, error: result?.error };
}
