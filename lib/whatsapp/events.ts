// lib/whatsapp/events.ts

import { sendWhatsAppAlert } from "@/lib/alerts/whatsapp";
import { sendWhatsAppMessage } from "./send";
import { sendWhatsAppButtons } from "./buttons";
import { sendWhatsAppReceipt } from "./receipt";
import { signRiderLink } from "../rider/sign";
import { normalizePhoneForWhatsApp } from "../utils/formatters/phone";
import { emitSecurityEvent } from "@/lib/events/emitter";

/**
 * Send a generic tracking update using a WhatsApp template.
 * Used for normal status changes (PENDING, IN_TRANSIT, etc.)
 */
export async function sendTrackingUpdate(order: any) {
  const status = order.fulfillments?.[0]?.status || "PENDING";

  const friendly = {
    PENDING: "being prepared",
    IN_TRANSIT: "on the way",
    OUT_FOR_DELIVERY: "out for delivery",
    DELIVERED: "delivered",
    FAILED: "failed",
  }[status];

  await emitSecurityEvent({
    type: "WHATSAPP_TRACKING_UPDATE_SENT",
    message: `Tracking update sent for order ${order.id}`,
    severity: "low",
    context: "whatsapp",
    operation: "send",
    category: "whatsapp",
    tags: ["whatsapp", "tracking_update", `status:${status}`],
    metadata: {
      orderId: order.id,
      status,
      friendly,
    },
  });

  return sendWhatsAppAlert({
    to: order.phone,
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

/**
 * Notify customer when order is out for delivery.
 * Also sends COD reminder if needed.
 */
export async function sendOutForDelivery(order: any) {
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
    to: order.phone,
    template: "order_out_for_delivery",
    variables: [order.id.slice(0, 8)],
    severity: "medium",
  });

  // COD reminder (Nigeria-specific)
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
      to: order.phone,
      template: "order_cod_reminder",
      variables: [order.id.slice(0, 8)],
      severity: "medium",
    });
  }
}

/**
 * Notify customer when order is delivered.
 * Also sends a WhatsApp receipt.
 */
export async function sendDelivered(order: any) {
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
    to: order.phone,
    template: "order_delivered",
    variables: [order.id.slice(0, 8)],
    severity: "low",
  });

  await sendWhatsAppReceipt(order);
}

/**
 * Notify customer when delivery fails.
 */
export async function sendFailed(order: any) {
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
    to: order.phone,
    template: "order_failed",
    variables: [order.id.slice(0, 8)],
    severity: "high",
  });
}

/**
 * Send rider update links when order goes OUT_FOR_DELIVERY.
 * Rider taps → status updates automatically.
 */
export async function sendRiderLinks(fulfillment: any) {
  const delivered = signRiderLink(fulfillment.id, "DELIVERED");
  const failed = signRiderLink(fulfillment.id, "FAILED");

  const message = `
Rider Update Link for Order #${fulfillment.orderId}

✔️ Delivered:
${delivered}

❌ Delivery Failed:
${failed}
  `;

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

  return sendWhatsAppMessage(fulfillment.order.phone, message);
}

/**
 * Send interactive buttons after a tracking response.
 */
export async function sendTrackingButtons(to: string, order: any) {
  const normalized = normalizePhoneForWhatsApp(to);

  await emitSecurityEvent({
    type: "WHATSAPP_TRACKING_BUTTONS_SENT",
    message: `Tracking buttons sent to ${normalized}`,
    severity: "low",
    context: "whatsapp",
    operation: "send",
    category: "whatsapp",
    tags: ["whatsapp", "tracking_buttons"],
    metadata: {
      to: normalized,
      orderId: order.id,
    },
  });

  return sendWhatsAppButtons({
    to: normalized,
    message: "What would you like to do next?",
    buttons: [
      { id: "track_again", title: "Track Again" },
      { id: "talk_support", title: "Talk to Support" },
      { id: "view_timeline", title: "View Timeline" },
    ],
  });
}
