// services/notification.templates.ts
import type { EventName, EventPayloads } from "../events/payloads";

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
 * Strongly typed template registry
 */
export const NotificationTemplates: {
  [E in EventName]?: TemplateFn<E>;
} = {
  // -----------------------------
  // ORDER
  // -----------------------------
  "order.confirmed": ({ orderId }) => ({
    event: "order.confirmed",
    subject: `Order #${orderId} Confirmed`,
    bodyText: `Your order ${orderId} has been confirmed.`,
    bodyHtml: `<p>Your order <strong>${orderId}</strong> has been confirmed.</p>`,
  }),

  "order.shipped": ({ orderId, shipmentId, trackingNumber }) => ({
    event: "order.shipped",
    subject: `Order #${orderId} Shipped`,
    bodyText: `Your order ${orderId} has shipped. Tracking: ${trackingNumber}`,
    bodyHtml: `<p>Your order <strong>${orderId}</strong> has shipped.</p>
               <p>Tracking: <strong>${trackingNumber}</strong></p>`,
  }),

  "order.delivered": ({ orderId }) => ({
    event: "order.delivered",
    subject: `Order #${orderId} Delivered`,
    bodyText: `Your order ${orderId} has been delivered.`,
    bodyHtml: `<p>Your order <strong>${orderId}</strong> has been delivered.</p>`,
  }),

  // -----------------------------
  // PAYMENT
  // -----------------------------
  "payment.success": ({ orderId, amount }) => ({
    event: "payment.success",
    subject: `Payment Received`,
    bodyText: `Your payment for order ${orderId} was successful. Amount: ₦${amount}`,
    bodyHtml: `<p>Your payment for order <strong>${orderId}</strong> was successful.</p>
               <p>Amount: <strong>₦${amount}</strong></p>`,
  }),

  "payment.failed": ({ orderId }) => ({
    event: "payment.failed",
    subject: `Payment Failed`,
    bodyText: `Your payment for order ${orderId} failed. Please try again.`,
    bodyHtml: `<p>Your payment for order <strong>${orderId}</strong> failed.</p>`,
  }),

  // -----------------------------
  // SHIPMENT
  // -----------------------------
  "shipment.created": ({ orderId, shipmentId }) => ({
    event: "shipment.created",
    subject: `Shipment Created`,
    bodyText: `A shipment has been created for order ${orderId}. Shipment ID: ${shipmentId}`,
    bodyHtml: `<p>A shipment has been created for order <strong>${orderId}</strong>.</p>
               <p>Shipment ID: <strong>${shipmentId}</strong></p>`,
  }),

  "shipment.failed_delivery": ({ orderId }) => ({
    event: "shipment.failed_delivery",
    subject: `Delivery Attempt Failed`,
    bodyText: `Delivery for order ${orderId} failed. We will contact you.`,
    bodyHtml: `<p>Delivery for order <strong>${orderId}</strong> failed.</p>`,
  }),
};
