// templates/whatsapp.templates.ts

/**
 * WhatsAppTemplateDefinition
 * - name: WhatsApp Cloud API template name
 * - resolve: maps event payload → array of WhatsApp template variables
 */
export interface WhatsAppTemplateDefinition {
  name: string;
  resolve: (payload: any) => string[];
}

/**
 * WhatsApp Templates
 *
 * IMPORTANT:
 * - Keys MUST match NotificationService → WhatsAppOutboundProducer.send(templateKey)
 * - Values MUST match actual WhatsApp Cloud API template names
 * - resolve() MUST return variables in the exact order defined in WhatsApp Manager
 */
export const whatsappTemplates: Record<string, WhatsAppTemplateDefinition> = {
  // ---------------------------------------------------------
  // ORDER LIFECYCLE
  // ---------------------------------------------------------

  "order.confirmed": {
    name: "order_confirmed", // WhatsApp template name
    resolve: ({ orderId }) => [orderId],
  },

  "order.shipped": {
    name: "order_shipped",
    resolve: ({ orderId, trackingNumber }) => [
      orderId,
      trackingNumber ?? "No tracking number",
    ],
  },

  "order.delivered": {
    name: "order_delivered",
    resolve: ({ orderId }) => [orderId],
  },

  "order.failed_delivery": {
    name: "order_failed_delivery",
    resolve: ({ orderId, reason }) => [
      orderId,
      reason ?? "Delivery attempt failed",
    ],
  },

  "order.returned": {
    name: "order_returned",
    resolve: ({ orderId, reason }) => [
      orderId,
      reason ?? "Item returned",
    ],
  },

  "order.cancelled": {
    name: "order_cancelled",
    resolve: ({ orderId, reason }) => [
      orderId,
      reason ?? "Order cancelled",
    ],
  },

  // ---------------------------------------------------------
  // PAYMENT
  // ---------------------------------------------------------

  "payment.success": {
    name: "payment_success",
    resolve: ({ orderId, amount, currency }) => [
      orderId,
      `${amount}`,
      currency ?? "NGN",
    ],
  },

  "payment.failed": {
    name: "payment_failed",
    resolve: ({ orderId, reason }) => [
      orderId,
      reason ?? "Payment could not be completed",
    ],
  },

  "payment.refunded": {
    name: "payment_refunded",
    resolve: ({ orderId, amount, reason }) => [
      orderId,
      `${amount}`,
      reason ?? "Refund processed",
    ],
  },

  // ---------------------------------------------------------
  // SHIPMENT
  // ---------------------------------------------------------

  "shipment.created": {
    name: "shipment_created",
    resolve: ({ orderId, trackingNumber }) => [
      orderId,
      trackingNumber ?? "No tracking number",
    ],
  },

  "shipment.failed_delivery": {
    name: "shipment_failed_delivery",
    resolve: ({ orderId, reason }) => [
      orderId,
      reason ?? "Delivery attempt failed",
    ],
  },

  // ---------------------------------------------------------
  // STOCK / INVENTORY (optional)
  // ---------------------------------------------------------

  "stock.reserved": {
    name: "stock_reserved",
    resolve: ({ reservationId, variantId }) => [
      reservationId,
      variantId,
    ],
  },

  "stock.released": {
    name: "stock_released",
    resolve: ({ reservationId, reason }) => [
      reservationId,
      reason ?? "Stock released",
    ],
  },

  // ---------------------------------------------------------
  // SYSTEM / SESSION (optional)
  // ---------------------------------------------------------

  "whatsapp.session.started": {
    name: "session_started",
    resolve: ({ sessionId }) => [sessionId],
  },

  "whatsapp.message.sent": {
    name: "message_sent",
    resolve: ({ message }) => [message],
  },
};
