import type { Actor } from "../domain/order-state-machine";
import { Events } from "./events";

export type EventName = (typeof Events)[keyof typeof Events];

export interface EventPayloads {
  // -----------------------------
  // ORDER
  // -----------------------------
  "order.created": {
    orderId: string;
    customerId?: string;
    sessionId?: string;
    customerPhone?: string;
    timestamp: Date;
  };

  "order.confirmed": {
    orderId: string;
    actor: Actor;
    sessionId?: string;
    customerPhone?: string;
    timestamp: Date;
  };

  "order.processing": {
    orderId: string;
    actor: Actor;
    sessionId?: string;
    customerPhone?: string;
    timestamp: Date;
  };

  "order.shipped": {
    orderId: string;
    shipmentId: string;
    carrier?: string;
    trackingNumber?: string;
    sessionId?: string;
    customerPhone?: string;
    timestamp: Date;
  };

  "order.delivered": {
    orderId: string;
    deliveredAt?: Date;
    sessionId?: string;
    customerPhone?: string;
    timestamp: Date;
  };

  "order.failed_delivery": {
    orderId: string;
    reason?: string;
    sessionId?: string;
    customerPhone?: string;
    timestamp: Date;
  };

  "order.returned": {
    orderId: string;
    reason?: string;
    sessionId?: string;
    customerPhone?: string;
    timestamp: Date;
  };

  "order.cancelled": {
    orderId: string;
    actor: Actor;
    reason?: string;
    sessionId?: string;
    customerPhone?: string;
    timestamp: Date;
  };

  "order.status.updated": {
    orderId: string;
    from: string;
    to: string;
    actor: Actor;
    sessionId?: string;
    customerPhone?: string;
    timestamp: Date;
  };

  // -----------------------------
  // PAYMENT
  // -----------------------------
  "payment.initiated": {
    paymentId: string;
    orderId: string;
    sessionId?: string;
    customerPhone?: string;
    timestamp: Date;
  };

  "payment.success": {
    paymentId: string;
    orderId: string;
    providerReference?: string;
    sessionId?: string;
    customerPhone?: string;
    timestamp: Date;
  };

  "payment.failed": {
    paymentId: string;
    orderId: string;
    reason?: string;
    sessionId?: string;
    customerPhone?: string;
    timestamp: Date;
  };

  "payment.confirmed": {
    paymentId: string;
    orderId: string;
    verifiedBy: string;
    sessionId?: string;
    customerPhone?: string;
    timestamp: Date;
  };

  "payment.refunded": {
    paymentId: string;
    orderId: string;
    amount: number;
    reason?: string;
    sessionId?: string;
    customerPhone?: string;
    timestamp: Date;
  };

  // -----------------------------
  // INVENTORY
  // -----------------------------
  "stock.reserved": {
    reservationId: string;
    variantId: string;
    quantity: number;
    orderId?: string;
    sessionId?: string;
    customerPhone?: string;
    timestamp: Date;
  };

  "stock.released": {
    reservationId: string;
    reason?: string;
    sessionId?: string;
    customerPhone?: string;
    timestamp: Date;
  };

  "stock.consumed": {
    reservationId: string;
    orderId: string;
    sessionId?: string;
    customerPhone?: string;
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
// TYPE SAFETY CHECKS
// ---------------------------------------------
type _CheckAllEventsHavePayloads = {
  [E in EventName]: E extends keyof EventPayloads ? true : never;
};

type _CheckNoExtraPayloads = {
  [E in keyof EventPayloads]: E extends EventName ? true : never;
};
