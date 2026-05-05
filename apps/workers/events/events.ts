export const Events = {
  // -----------------------------
  // ORDER LIFECYCLE
  // -----------------------------
  ORDER_CREATED: "order.created",
  ORDER_CONFIRMED: "order.confirmed",
  ORDER_PROCESSING: "order.processing",
  ORDER_SHIPPED: "order.shipped",
  ORDER_DELIVERED: "order.delivered",
  ORDER_FAILED_DELIVERY: "order.failed_delivery",
  ORDER_RETURNED: "order.returned",
  ORDER_CANCELLED: "order.cancelled",
  ORDER_STATUS_UPDATED: "order.status.updated",

  // -----------------------------
  // PAYMENT
  // -----------------------------
  PAYMENT_INITIATED: "payment.initiated",
  PAYMENT_SUCCESS: "payment.success",
  PAYMENT_FAILED: "payment.failed",
  PAYMENT_CONFIRMED: "payment.confirmed",
  PAYMENT_REFUNDED: "payment.refunded",

  // -----------------------------
  // INVENTORY
  // -----------------------------
  STOCK_RESERVED: "stock.reserved",
  STOCK_RELEASED: "stock.released",
  STOCK_CONSUMED: "stock.consumed",
  STOCK_EXPIRED: "stock.expired",

  // -----------------------------
  // WHATSAPP
  // -----------------------------
  WHATSAPP_SESSION_STARTED: "whatsapp.session.started",
  WHATSAPP_SESSION_UPDATED: "whatsapp.session.updated",
  WHATSAPP_SESSION_ENDED: "whatsapp.session.ended",
  WHATSAPP_MESSAGE_RECEIVED: "whatsapp.message.received",
  WHATSAPP_MESSAGE_SENT: "whatsapp.message.sent",

  // -----------------------------
  // SYSTEM / AUDIT
  // -----------------------------
  AUDIT_LOG_CREATED: "audit.created",
  SYSTEM_HEARTBEAT: "system.heartbeat",
} as const;
