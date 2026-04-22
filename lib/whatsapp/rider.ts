// lib/whatsapp/rider.ts

import { sendWhatsAppMessage } from "./send";
import { signRiderLink } from "../rider/sign";
import { normalizePhoneForWhatsApp } from "../utils/formatters/phone";
import { emitSecurityEvent } from "@/lib/events/emitter";

export async function sendRiderLinks(fulfillment: any) {
  const normalized = normalizePhoneForWhatsApp(fulfillment.order.phone) || fulfillment.order.phone;

  const delivered = signRiderLink(fulfillment.id, "DELIVERED");
  const failed = signRiderLink(fulfillment.id, "FAILED");

  const message = `
Rider Update Link for Order #${fulfillment.orderId}

Tap one option:

✔️ Delivered:
${delivered}

❌ Delivery Failed:
${failed}
  `;

  /* -------------------------------------------------- */
  /* Log rider link generation                           */
  /* -------------------------------------------------- */
  await emitSecurityEvent({
    type: "WHATSAPP_RIDER_LINKS_GENERATED",
    message: `Generated rider update links for fulfillment ${fulfillment.id}`,
    severity: "medium",
    context: "whatsapp",
    operation: "generate",
    category: "whatsapp",
    tags: ["whatsapp", "rider_links", "generated"],
    metadata: {
      fulfillmentId: fulfillment.id,
      orderId: fulfillment.orderId,
      phone: normalized,
    },
    source: "whatsapp_api",
  });

  /* -------------------------------------------------- */
  /* Send message                                        */
  /* -------------------------------------------------- */
  const result = await sendWhatsAppMessage(normalized, message);

  /* -------------------------------------------------- */
  /* Log success/failure                                 */
  /* -------------------------------------------------- */
  if (result?.ok) {
    await emitSecurityEvent({
      type: "WHATSAPP_RIDER_LINKS_SENT",
      message: `Rider update links sent to ${normalized}`,
      severity: "low",
      context: "whatsapp",
      operation: "send",
      category: "whatsapp",
      tags: ["whatsapp", "rider_links", "sent"],
      metadata: {
        fulfillmentId: fulfillment.id,
        orderId: fulfillment.orderId,
        phone: normalized,
      },
      source: "whatsapp_api",
    });
  } else {
    await emitSecurityEvent({
      type: "WHATSAPP_RIDER_LINKS_SEND_FAILED",
      message: `Failed to send rider update links to ${normalized}`,
      severity: "high",
      context: "whatsapp",
      operation: "send",
      category: "whatsapp",
      tags: ["whatsapp", "rider_links", "failed"],
      metadata: {
        fulfillmentId: fulfillment.id,
        orderId: fulfillment.orderId,
        phone: normalized,
        error: result?.error,
      },
      source: "whatsapp_api",
    });
  }

  return result;
}
