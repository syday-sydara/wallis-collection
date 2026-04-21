// lib/whatsapp/events.ts

import { sendWhatsAppAlert } from "@/lib/alerts/whatsapp";
import { sendWhatsAppMessage } from "./send";
import { sendWhatsAppButtons } from "./buttons";
import { sendWhatsAppReceipt } from "./receipt";
import { signRiderLink } from "../rider/sign";

/**
 * Send a generic tracking update using a WhatsApp template.
 * This is used for normal status changes (PENDING, IN_TRANSIT, etc.)
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
  await sendWhatsAppAlert({
    to: order.phone,
    template: "order_out_for_delivery",
    variables: [order.id.slice(0, 8)],
    severity: "medium",
  });

  // COD reminder (Nigeria-specific)
  if (order.paymentMethod === "CASH") {
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
 */
export async function sendDelivered(order: any) {
  await sendWhatsAppAlert({
    to: order.phone,
    template: "order_delivered",
    variables: [order.id.slice(0, 8)],
    severity: "low",
  });

  // Optionally send receipt
  await sendWhatsAppReceipt(order);
}

/**
 * Notify customer when delivery fails.
 */
export async function sendFailed(order: any) {
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

  return sendWhatsAppMessage(fulfillment.order.phone, message);
}

/**
 * Send interactive buttons after a tracking response.
 */
export async function sendTrackingButtons(to: string, order: any) {
  return sendWhatsAppButtons(to, "What would you like to do next?", [
    { id: "track_again", title: "Track Again" },
    { id: "talk_support", title: "Talk to Support" },
    {
      id: "view_timeline",
      title: "View Timeline",
    },
  ]);
}
