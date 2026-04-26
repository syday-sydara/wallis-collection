// lib/whatsapp/events.ts

import { sendWhatsAppAlert } from "@/lib/alerts/whatsapp";
import { sendWhatsAppMessage } from "./send";
import { sendWhatsAppButtons } from "./buttons";
import { sendWhatsAppReceipt } from "./receipt";
import { signRiderLink } from "../rider/sign";
import { normalizePhoneForWhatsApp } from "../utils/formatters/phone";
import { emitSecurityEvent } from "@/lib/events/emitter";

/* -------------------------------------------------- */
/* Helper: Safe phone normalization                    */
/* -------------------------------------------------- */
function safePhone(raw: string) {
  const normalized = normalizePhoneForWhatsApp(raw);
  if (!normalized) {
    emitSecurityEvent({
      type: "WHATSAPP_INVALID_NUMBER",
      message: `Invalid WhatsApp number: ${raw}`,
      severity: "medium",
      context: "whatsapp",
      operation: "validate",
      category: "whatsapp",
      tags: ["whatsapp", "invalid_number"],
      metadata: { raw },
      source: "whatsapp_api",
    });
  }
  return normalized;
}

/* -------------------------------------------------- */
/* Tracking update (generic status change)             */
/* -------------------------------------------------- */
export async function sendTrackingUpdate(order: any) {
  const phone = safePhone(order.phone);
  if (!phone) return { ok: false, error: "invalid_phone" };

  const status = order.fulfillments?.[0]?.status || "PENDING";

  const friendly = {
    PENDING: "being prepared",
    IN_TRANSIT: "on the way",
    OUT_FOR_DELIVERY: "out for delivery",
    DELIVERED: "delivered",
    FAILED: "failed",
  }[status] ?? "being prepared";

  await emitSecurityEvent({
    type: "WHATSAPP_TRACKING_UPDATE_SENT",
    message: `Tracking update sent for order ${order.id}`,
    severity: "low",
    context: "whatsapp",
    operation: "send",
    category: "whatsapp",
    tags: ["whatsapp", "tracking_update", `status:${status}`],
    metadata: { orderId: order.id, status, friendly },
  });

  return sendWhatsAppAlert({
    to: phone,
    template: "order_tracking_update",
    variables: [
      order.fullName || "Customer",
      order.id.slice(0, 8),
      friendly,
      `${process.env.NEXT_PUBLIC_APP_URL}/track/${order.trackingToken}`,
    ],
    severity: "low",
  });
}

/* -------------------------------------------------- */
/* Out for delivery + COD reminder                     */
/* -------------------------------------------------- */
export async function sendOutForDelivery(order: any) {
  const phone = safePhone(order.phone);
  if (!phone) return { ok: false, error: "invalid_phone" };

  await emitSecurityEvent({
    type: "WHATSAPP_OUT_FOR_DELIVERY_SENT",
    message: `Out-for-delivery notification sent for order ${order.id}`,
    severity: "medium",
    context: "whatsapp",
    operation: "send",
    category: "whatsapp",
    tags: ["whatsapp", "ofd"],
    metadata: { orderId: order.id },
  });

  await sendWhatsAppAlert({
    to: phone,
    template: "order_out_for_delivery",
    variables: [order.id.slice(0, 8)],
    severity: "medium",
  });

  if (order.paymentMethod === "CASH") {
    await emitSecurityEvent({
      type: "WHATSAPP_COD_REMINDER_SENT",
      message: `COD reminder sent for order ${order.id}`,
      severity: "medium",
      context: "whatsapp",
      operation: "send",
      category: "whatsapp",
      tags: ["whatsapp", "cod_reminder"],
      metadata: { orderId: order.id },
    });

    await sendWhatsAppAlert({
      to: phone,
      template: "order_cod_reminder",
      variables: [order.id.slice(0, 8)],
      severity: "medium",
    });
  }

  return { ok: true };
}

/* -------------------------------------------------- */
/* Delivered + receipt                                 */
/* -------------------------------------------------- */
export async function sendDelivered(order: any) {
  const phone = safePhone(order.phone);
  if (!phone) return { ok: false, error: "invalid_phone" };

  await emitSecurityEvent({
    type: "WHATSAPP_DELIVERED_SENT",
    message: `Delivery confirmation sent for order ${order.id}`,
    severity: "low",
    context: "whatsapp",
    operation: "send",
    category: "whatsapp",
    tags: ["whatsapp", "delivered"],
    metadata: { orderId: order.id },
  });

  await sendWhatsAppAlert({
    to: phone,
    template: "order_delivered",
    variables: [order.id.slice(0, 8)],
    severity: "low",
  });

  await sendWhatsAppReceipt(order);

  return { ok: true };
}

/* -------------------------------------------------- */
/* Delivery failed                                     */
/* -------------------------------------------------- */
export async function sendFailed(order: any) {
  const phone = safePhone(order.phone);
  if (!phone) return { ok: false, error: "invalid_phone" };

  await emitSecurityEvent({
    type: "WHATSAPP_DELIVERY_FAILED_SENT",
    message: `Delivery failure notification sent for order ${order.id}`,
    severity: "high",
    context: "whatsapp",
    operation: "send",
    category: "whatsapp",
    tags: ["whatsapp", "delivery_failed"],
    metadata: { orderId: order.id },
  });

  return sendWhatsAppAlert({
    to: phone,
    template: "order_failed",
    variables: [order.id.slice(0, 8)],
    severity: "high",
  });
}

/* -------------------------------------------------- */
/* Rider update links                                  */
/* -------------------------------------------------- */
export async function sendRiderLinks(fulfillment: any) {
  const phone = safePhone(fulfillment.order?.phone);
  if (!phone) return { ok: false, error: "invalid_phone" };

  const delivered = signRiderLink(fulfillment.id, "DELIVERED");
  const failed = signRiderLink(fulfillment.id, "FAILED");

  const message = [
    `Rider Update Link for Order #${fulfillment.orderId}`,
    "",
    `✔️ Delivered:\n${delivered}`,
    "",
    `❌ Delivery Failed:\n${failed}`,
  ].join("\n");

  await emitSecurityEvent({
    type: "WHATSAPP_RIDER_LINKS_SENT",
    message: `Rider update links sent for fulfillment ${fulfillment.id}`,
    severity: "medium",
    context: "whatsapp",
    operation: "send",
    category: "whatsapp",
    tags: ["whatsapp", "rider_links"],
    metadata: {
      fulfillmentId: fulfillment.id,
      orderId: fulfillment.orderId,
    },
  });

  return sendWhatsAppMessage(phone, message);
}

/* -------------------------------------------------- */
/* Tracking buttons                                    */
/* -------------------------------------------------- */
export async function sendTrackingButtons(to: string, order: any) {
  const phone = safePhone(to);
  if (!phone) return { ok: false, error: "invalid_phone" };

  await emitSecurityEvent({
    type: "WHATSAPP_TRACKING_BUTTONS_SENT",
    message: `Tracking buttons sent to ${phone}`,
    severity: "low",
    context: "whatsapp",
    operation: "send",
    category: "whatsapp",
    tags: ["whatsapp", "tracking_buttons"],
    metadata: { to: phone, orderId: order.id },
  });

  return sendWhatsAppButtons({
    to: phone,
    message: "What would you like to do next?",
    buttons: [
      { id: "track_again", title: "Track Again" },
      { id: "talk_support", title: "Talk to Support" },
      { id: "view_timeline", title: "View Timeline" },
    ],
  });
}
