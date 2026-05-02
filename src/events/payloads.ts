import type { Actor } from "../domain/order-state-machine";
import { Events } from "./events";

// Ensures EventPayloads keys ALWAYS match Events.* values
export type EventName = (typeof Events)[keyof typeof Events];

export interface EventPayloads {
  // -----------------------------
  // ORDER
  // -----------------------------
  "order.created": {
    orderId: string;
    userId?: string;
    sessionId?: string;
    timestamp: Date;
  };

  "order.confirmed": {
    orderId: string;
    actor: Actor;
    timestamp: Date;
  };

  "order.processing": {
    orderId: string;
    actor: Actor;
    timestamp: Date;
  };

  "order.shipped": {
    orderId: string;
    shipmentId: string;
    carrier?: string;
    trackingNumber?: string;
    timestamp: Date;
  };

  "order.delivered": {
    orderId: string;
    deliveredAt: Date;
    timestamp: Date;
  };

  "order.failed_delivery": {
    orderId: string;
    reason?: string;
    timestamp: Date;
  };

  "order.returned": {
    orderId: string;
    reason?: string;
    timestamp: Date;
  };

  "order.cancelled": {
    orderId: string;
    actor: Actor;
    reason?: string;
    timestamp: Date;
  };

  "order.status.updated": {
    orderId: string;
    from: string;
    to: string;
    actor: Actor;
    timestamp: Date;
  };

  // -----------------------------
  // PAYMENT
  // -----------------------------
  "payment.initiated": {
    paymentId: string;
    orderId: string;
    timestamp: Date;
  };

  "payment.success": {
    paymentId: string;
    orderId: string;
    providerReference?: string;
    timestamp: Date;
  };

  "payment.failed": {
    paymentId: string;
    orderId: string;
    reason?: string;
    timestamp: Date;
  };

  "payment.confirmed": {
    paymentId: string;
    orderId: string;
    verifiedBy: string;
    timestamp: Date;
  };

  "payment.refunded": {
    paymentId: string;
    orderId: string;
    amount: number;
    reason?: string;
    timestamp: Date;
  };

  // -----------------------------
  // INVENTORY
  // -----------------------------
  "stock.reserved": {
    reservationId: string;
    variantId: string;
    quantity: number;
    timestamp: Date;
  };

  "stock.released": {
    reservationId: string;
    reason?: string;
    timestamp: Date;
  };

  "stock.consumed": {
    reservationId: string;
    orderId: string;
    timestamp: Date;
  };

  "stock.expired": {
    reservationId: string;
    timestamp: Date;
  };

  // -----------------------------
  // WHATSAPP
  // -----------------------------
  "whatsapp.session.started": {
    sessionId: string;
    phone: string;
    timestamp: Date;
  };

  "whatsapp.session.updated": {
    sessionId: string;
    lastMessageAt: Date;
    timestamp: Date;
  };

  "whatsapp.session.ended": {
    sessionId: string;
    reason?: string;
    timestamp: Date;
  };

  "whatsapp.message.received": {
    sessionId: string;
    messageId: string;
    message: string;
    timestamp: Date;
  };

  "whatsapp.message.sent": {
    sessionId: string;
    messageId: string;
    message: string;
    timestamp: Date;
  };

  // -----------------------------
  // AUDIT
  // -----------------------------
  "audit.created": {
    logId: string;
    timestamp: Date;
  };

  // -----------------------------
  // SYSTEM
  // -----------------------------
  "system.heartbeat": {
    worker: string;
    timestamp: Date;
  };
}

// ---------------------------------------------
// TYPE SAFETY CHECKS (compile-time only)
// ---------------------------------------------

// 1. Ensure every event in Events has a payload
type _CheckAllEventsHavePayloads = {
  [E in EventName]: E extends keyof EventPayloads ? true : never;
};

// 2. Ensure no extra payload keys exist
type _CheckNoExtraPayloads = {
  [E in keyof EventPayloads]: E extends EventName ? true : never;
};
