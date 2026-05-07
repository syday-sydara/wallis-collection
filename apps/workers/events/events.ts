// events/events.ts

export const Events = {
  Order: {
    Created: "order.created.v1",
    Confirmed: "order.confirmed.v1",
    Processing: "order.processing.v1",
    Shipped: "order.shipped.v1",
    Delivered: "order.delivered.v1",
    FailedDelivery: "order.failed_delivery.v1",
    Returned: "order.returned.v1",
    Cancelled: "order.cancelled.v1",
    StatusUpdated: "order.status.updated.v1",
  },

  Payment: {
    Initiated: "payment.initiated.v1",
    Success: "payment.success.v1",
    Failed: "payment.failed.v1",
    Confirmed: "payment.confirmed.v1",
    Refunded: "payment.refunded.v1",
  },

  Inventory: {
    Reserved: "stock.reserved.v1",
    Released: "stock.released.v1",
    Consumed: "stock.consumed.v1",
    Expired: "stock.expired.v1",
  },

  WhatsApp: {
    SessionStarted: "whatsapp.session.started.v1",
    SessionUpdated: "whatsapp.session.updated.v1",
    SessionEnded: "whatsapp.session.ended.v1",
    MessageReceived: "whatsapp.message.received.v1",
    MessageSent: "whatsapp.message.sent.v1",
  },

  System: {
    AuditLogCreated: "audit.created.v1",
    Heartbeat: "system.heartbeat.v1",
  },
} as const;

// Flatten namespaced events into a union of string literals
export type EventName =
  (typeof Events)[keyof typeof Events][keyof (typeof Events)[keyof typeof Events]];
