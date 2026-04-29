// lib/whatsapp/events.ts

import { withSpan } from "@/lib/core/with-span";
import { log } from "@/lib/core/log";
import { metricsWithContext } from "@/lib/core/metrics-context";
import { serviceContext } from "@/lib/core/service-context";
import { emitSecurityEvent } from "@/lib/events/emitter";
import { EventSource } from "@/lib/events/types";

import { sendWhatsAppAlert } from "@/lib/alerts/whatsapp";
import { sendWhatsAppMessage } from "./send";
import { sendWhatsAppButtons } from "./onboarding/buttons";
import { sendWhatsAppReceipt } from "./receipt";
import { signRiderLink } from "../rider/sign";
import { normalizePhoneForWhatsApp } from "../utils/formatters/phone";

/* -------------------------------------------------- */
/* Helpers                                             */
/* -------------------------------------------------- */

function shortId(id: string) {
  return id.slice(0, 8);
}

function normalize(orderOrPhone: any) {
  return typeof orderOrPhone === "string"
    ? normalizePhoneForWhatsApp(orderOrPhone)
    : normalizePhoneForWhatsApp(orderOrPhone.phone);
}

async function recordEvent(type: string, severity: "low" | "medium" | "high", metadata: any) {
  const ctx = serviceContext.get();

  metricsWithContext.increment(`whatsapp.${type.toLowerCase()}`);

  await emitSecurityEvent({
    kind: "security",
    type,
    message: `${type} triggered`,
    severity,
    tags: ["whatsapp", type.toLowerCase()],
    metadata: { ...metadata, ...ctx },
    source: EventSource.WhatsAppAPI,
  });

  log.info(`WhatsApp event: ${type}`, metadata);
}

/* -------------------------------------------------- */
/* Tracking Update                                     */
/* -------------------------------------------------- */

export async function sendTrackingUpdate(order: any) {
  return withSpan("whatsapp.send_tracking_update", async () => {
    const status = order.fulfillments?.[0]?.status || "PENDING";

    const friendly = {
      PENDING: "being prepared",
      IN_TRANSIT: "on the way",
      OUT_FOR_DELIVERY: "out for delivery",
      DELIVERED: "delivered",
      FAILED: "failed",
    }[status];

    await recordEvent("WHATSAPP_TRACKING_UPDATE_SENT", "low", {
      orderId: order.id,
      status,
      friendly,
    });

    return sendWhatsAppAlert({
      to: normalize(order),
      template: "order_tracking_update",
      variables: [
        order.fullName || "Customer",
        shortId(order.id),
        friendly,
        `${process.env.NEXT_PUBLIC_APP_URL}/track/${order.trackingToken}`,
      ],
      severity: "low",
    });
  });
}

/* -------------------------------------------------- */
/* Out for Delivery                                    */
/* -------------------------------------------------- */

export async function sendOutForDelivery(order: any) {
  return withSpan("whatsapp.send_out_for_delivery", async () => {
    await recordEvent("WHATSAPP_OUT_FOR_DELIVERY_SENT", "medium", {
      orderId: order.id,
    });

    await sendWhatsAppAlert({
      to: normalize(order),
      template: "order_out_for_delivery",
      variables: [shortId(order.id)],
      severity: "medium",
    });

    if (order.paymentMethod === "CASH") {
      await recordEvent("WHATSAPP_COD_REMINDER_SENT", "medium", {
        orderId: order.id,
      });

      await sendWhatsAppAlert({
        to: normalize(order),
        template: "order_cod_reminder",
        variables: [shortId(order.id)],
        severity: "medium",
      });
    }
  });
}

/* -------------------------------------------------- */
/* Delivered                                           */
/* -------------------------------------------------- */

export async function sendDelivered(order: any) {
  return withSpan("whatsapp.send_delivered", async () => {
    await recordEvent("WHATSAPP_DELIVERED_SENT", "low", {
      orderId: order.id,
    });

    await sendWhatsAppAlert({
      to: normalize(order),
      template: "order_delivered",
      variables: [shortId(order.id)],
      severity: "low",
    });

    return sendWhatsAppReceipt(order);
  });
}

/* -------------------------------------------------- */
/* Failed Delivery                                     */
/* -------------------------------------------------- */

export async function sendFailed(order: any) {
  return withSpan("whatsapp.send_failed", async () => {
    await recordEvent("WHATSAPP_DELIVERY_FAILED_SENT", "high", {
      orderId: order.id,
    });

    return sendWhatsAppAlert({
      to: normalize(order),
      template: "order_failed",
      variables: [shortId(order.id)],
      severity: "high",
    });
  });
}

/* -------------------------------------------------- */
/* Rider Links                                         */
/* -------------------------------------------------- */

export async function sendRiderLinks(fulfillment: any) {
  return withSpan("whatsapp.send_rider_links", async () => {
    const delivered = signRiderLink(fulfillment.id, "DELIVERED");
    const failed = signRiderLink(fulfillment.id, "FAILED");

    await recordEvent("WHATSAPP_RIDER_LINKS_SENT", "medium", {
      fulfillmentId: fulfillment.id,
      orderId: fulfillment.orderId,
    });

    const message = `
Rider Update Link for Order #${fulfillment.orderId}

✔️ Delivered:
${delivered}

❌ Delivery Failed:
${failed}
    `;

    return sendWhatsAppMessage(normalize(fulfillment.order.phone), message);
  });
}

/* -------------------------------------------------- */
/* Tracking Buttons                                    */
/* -------------------------------------------------- */

export async function sendTrackingButtons(to: string, order: any) {
  return withSpan("whatsapp.send_tracking_buttons", async () => {
    const normalized = normalize(to);

    await recordEvent("WHATSAPP_TRACKING_BUTTONS_SENT", "low", {
      to: normalized,
      orderId: order.id,
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
  });
}
