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

  // -----------------------------
  // PAYMENT
  // -----------------------------
  PAYMENT_INITIATED: "payment.initiated",
  PAYMENT_SUCCESS: "payment.success",
  PAYMENT_FAILED: "payment.failed",
  PAYMENT_CONFIRMED: "payment.confirmed",

  // -----------------------------
  // INVENTORY
  // -----------------------------
  STOCK_RESERVED: "stock.reserved",
  STOCK_RELEASED: "stock.released",
  STOCK_CONSUMED: "stock.consumed",

  // -----------------------------
  // WHATSAPP
  // -----------------------------
  WHATSAPP_SESSION_STARTED: "whatsapp.session.started",
  WHATSAPP_SESSION_UPDATED: "whatsapp.session.updated",
  WHATSAPP_MESSAGE_RECEIVED: "whatsapp.message.received",
  WHATSAPP_MESSAGE_SENT: "whatsapp.message.sent",

  // -----------------------------
  // SYSTEM / AUDIT
  // -----------------------------
  AUDIT_LOG_CREATED: "audit.created",
} as const;
