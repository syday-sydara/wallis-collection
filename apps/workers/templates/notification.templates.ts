// services/notification.templates.ts
import type { EventName, EventPayloads } from "@/events/payloads";

export type NotificationMessage = {
  subject: string;
  bodyText: string;
  bodyHtml: string;
  event: EventName;
};

type TemplateFn<E extends EventName> = (
  payload: EventPayloads[E] & { email?: string; phoneNumber?: string }
) => NotificationMessage;

/**
 * Shared helper to remove duplication.
 */
function buildMessage(
  event: EventName,
  subject: string,
  text: string,
  html: string
): NotificationMessage {
  return { event, subject, bodyText: text, bodyHtml: html };
}

/**
 * Strongly typed template registry (de‑duplicated).
 */
export const NotificationTemplates: {
  [E in EventName]?: TemplateFn<E>;
} = {
  // -----------------------------
  // ORDER
  // -----------------------------
  "order.confirmed": ({ orderId }) =>
    buildMessage(
      "order.confirmed",
      `Order #${orderId} Confirmed`,
      `Your order ${orderId} has been confirmed.`,
      `<p>Your order <strong>${orderId}</strong> has been confirmed.</p>`
    ),

  "order.shipped": ({ orderId, trackingNumber }) =>
    buildMessage(
      "order.shipped",
      `Order #${orderId} Shipped`,
      `Your order ${orderId} has shipped. Tracking: ${trackingNumber}`,
      `<p>Your order <strong>${orderId}</strong> has shipped.</p>
       <p>Tracking: <strong>${trackingNumber}</strong></p>`
    ),

  "order.delivered": ({ orderId }) =>
    buildMessage(
      "order.delivered",
      `Order #${orderId} Delivered`,
      `Your order ${orderId} has been delivered.`,
      `<p>Your order <strong>${orderId}</strong> has been delivered.</p>`
    ),

  // -----------------------------
  // PAYMENT
  // -----------------------------
  "payment.success": ({ orderId, amount }) =>
    buildMessage(
      "payment.success",
      `Payment Received`,
      `Your payment for order ${orderId} was successful. Amount: ₦${amount}`,
      `<p>Your payment for order <strong>${orderId}</strong> was successful.</p>
       <p>Amount: <strong>₦${amount}</strong></p>`
    ),

  "payment.failed": ({ orderId }) =>
    buildMessage(
      "payment.failed",
      `Payment Failed`,
      `Your payment for order ${orderId} failed. Please try again.`,
      `<p>Your payment for order <strong>${orderId}</strong> failed.</p>`
    ),

  // -----------------------------
  // SHIPMENT
  // -----------------------------
  "shipment.created": ({ orderId, shipmentId }) =>
    buildMessage(
      "shipment.created",
      `Shipment Created`,
      `A shipment has been created for order ${orderId}. Shipment ID: ${shipmentId}`,
      `<p>A shipment has been created for order <strong>${orderId}</strong>.</p>
       <p>Shipment ID: <strong>${shipmentId}</strong></p>`
    ),

  "shipment.failed_delivery": ({ orderId }) =>
    buildMessage(
      "shipment.failed_delivery",
      `Delivery Attempt Failed`,
      `Delivery for order ${orderId} failed. We will contact you.`,
      `<p>Delivery for order <strong>${orderId}</strong> failed.</p>`
    ),
};
