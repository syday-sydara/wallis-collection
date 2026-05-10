// templates/whatsapp.templates.ts

export interface WhatsAppTemplateDefinition {
  name: string;
  resolve: (payload: any) => string[];
}

/**
 * Shared helper to remove duplication.
 * Ensures:
 * - consistent template shape
 * - consistent variable ordering
 * - consistent fallback handling
 */
function tpl(
  name: string,
  resolver: (payload: any) => (string | number | null | undefined)[]
): WhatsAppTemplateDefinition {
  return {
    name,
    resolve: (payload: any) =>
      resolver(payload).map((v) => (v == null ? "" : String(v))),
  };
}

/**
 * Strongly typed WhatsApp template registry (de‑duplicated).
 */
export const whatsappTemplates: Record<string, WhatsAppTemplateDefinition> = {
  // ---------------------------------------------------------
  // ORDER LIFECYCLE
  // ---------------------------------------------------------
  "order.confirmed": tpl("order_confirmed", ({ orderId }) => [orderId]),

  "order.shipped": tpl("order_shipped", ({ orderId, trackingNumber }) => [
    orderId,
    trackingNumber ?? "No tracking number",
  ]),

  "order.delivered": tpl("order_delivered", ({ orderId }) => [orderId]),

  "order.failed_delivery": tpl(
    "order_failed_delivery",
    ({ orderId, reason }) => [orderId, reason ?? "Delivery attempt failed"]
  ),

  "order.returned": tpl("order_returned", ({ orderId, reason }) => [
    orderId,
    reason ?? "Item returned",
  ]),

  "order.cancelled": tpl("order_cancelled", ({ orderId, reason }) => [
    orderId,
    reason ?? "Order cancelled",
  ]),

  // ---------------------------------------------------------
  // PAYMENT
  // ---------------------------------------------------------
  "payment.success": tpl(
    "payment_success",
    ({ orderId, amount, currency }) => [
      orderId,
      amount,
      currency ?? "NGN",
    ]
  ),

  "payment.failed": tpl("payment_failed", ({ orderId, reason }) => [
    orderId,
    reason ?? "Payment could not be completed",
  ]),

  "payment.refunded": tpl(
    "payment_refunded",
    ({ orderId, amount, reason }) => [
      orderId,
      amount,
      reason ?? "Refund processed",
    ]
  ),

  // ---------------------------------------------------------
  // SHIPMENT
  // ---------------------------------------------------------
  "shipment.created": tpl(
    "shipment_created",
    ({ orderId, trackingNumber }) => [
      orderId,
      trackingNumber ?? "No tracking number",
    ]
  ),

  "shipment.failed_delivery": tpl(
    "shipment_failed_delivery",
    ({ orderId, reason }) => [
      orderId,
      reason ?? "Delivery attempt failed",
    ]
  ),

  // ---------------------------------------------------------
  // STOCK / INVENTORY
  // ---------------------------------------------------------
  "stock.reserved": tpl("stock_reserved", ({ reservationId, variantId }) => [
    reservationId,
    variantId,
  ]),

  "stock.released": tpl("stock_released", ({ reservationId, reason }) => [
    reservationId,
    reason ?? "Stock released",
  ]),

  // ---------------------------------------------------------
  // SYSTEM / SESSION
  // ---------------------------------------------------------
  "whatsapp.session.started": tpl("session_started", ({ sessionId }) => [
    sessionId,
  ]),

  "whatsapp.message.sent": tpl("message_sent", ({ message }) => [message]),
};
