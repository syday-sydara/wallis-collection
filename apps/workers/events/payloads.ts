// events/payloads.ts
import type { Actor } from "../domain/order-state-machine";
import type { EventName } from "./events";

export interface EventPayloads {
  "order.created.v1": {
    orderId: string;
    customerId?: string;
    sessionId?: string;
    customerPhone?: string;
    timestamp: Date;
  };

  "order.confirmed.v1": {
    orderId: string;
    actor: Actor;
    sessionId?: string;
    customerPhone?: string;
    timestamp: Date;
  };

  "order.processing.v1": {
    orderId: string;
    actor: Actor;
    sessionId?: string;
    customerPhone?: string;
    timestamp: Date;
  };

  "order.shipped.v1": {
    orderId: string;
    shipmentId: string;
    carrier?: string;
    trackingNumber?: string;
    sessionId?: string;
    customerPhone?: string;
    timestamp: Date;
  };

  "order.delivered.v1": {
    orderId: string;
    deliveredAt?: Date;
    sessionId?: string;
    customerPhone?: string;
    timestamp: Date;
  };

  "order.failed_delivery.v1": {
    orderId: string;
    reason?: string;
    sessionId?: string;
    customerPhone?: string;
    timestamp: Date;
  };

  "order.returned.v1": {
    orderId: string;
    reason?: string;
    sessionId?: string;
    customerPhone?: string;
    timestamp: Date;
  };

  "order.cancelled.v1": {
    orderId: string;
    actor: Actor;
    reason?: string;
    sessionId?: string;
    customerPhone?: string;
    timestamp: Date;
  };

  "order.status.updated.v1": {
    orderId: string;
    from: string;
    to: string;
    actor: Actor;
    sessionId?: string;
    customerPhone?: string;
    timestamp: Date;
  };

  "payment.initiated.v1": {
    paymentId: string;
    orderId: string;
    sessionId?: string;
    customerPhone?: string;
    timestamp: Date;
  };

  "payment.success.v1": {
    paymentId: string;
    orderId: string;
    providerReference?: string;
    sessionId?: string;
    customerPhone?: string;
    timestamp: Date;
  };

  "payment.failed.v1": {
    paymentId: string;
    orderId: string;
    reason?: string;
    sessionId?: string;
    customerPhone?: string;
    timestamp: Date;
  };

  "payment.confirmed.v1": {
    paymentId: string;
    orderId: string;
    verifiedBy: string;
    sessionId?: string;
    customerPhone?: string;
    timestamp: Date;
  };

  "payment.refunded.v1": {
    paymentId: string;
    orderId: string;
    amount: number;
    reason?: string;
    sessionId?: string;
    customerPhone?: string;
    timestamp: Date;
  };

  "stock.reserved.v1": {
    reservationId: string;
    variantId: string;
    quantity: number;
    orderId?: string;
    sessionId?: string;
    customerPhone?: string;
    timestamp: Date;
  };

  "stock.released.v1": {
    reservationId: string;
    reason?: string;
    sessionId?: string;
    customerPhone?: string;
    timestamp: Date;
  };

  "stock.consumed.v1": {
    reservationId: string;
    orderId: string;
    sessionId?: string;
    customerPhone?: string;
    timestamp: Date;
  };

  "stock.expired.v1": {
    reservationId: string;
    timestamp: Date;
  };

  "whatsapp.session.started.v1": {
    sessionId: string;
    phone: string;
    timestamp: Date;
  };

  "whatsapp.session.updated.v1": {
    sessionId: string;
    lastMessageAt: Date;
    timestamp: Date;
  };

  "whatsapp.session.ended.v1": {
    sessionId: string;
    reason?: string;
    timestamp: Date;
  };

  "whatsapp.message.received.v1": {
    sessionId: string;
    messageId: string;
    message: string;
    timestamp: Date;
  };

  "whatsapp.message.sent.v1": {
    sessionId: string;
    messageId: string;
    message: string;
    timestamp: Date;
  };

  "audit.created.v1": {
    logId: string;
    timestamp: Date;
  };

  "system.heartbeat.v1": {
    worker: string;
    timestamp: Date;
  };
}

// Compile‑time consistency checks
type _CheckAllEventsHavePayloads = {
  [E in EventName]: E extends keyof EventPayloads ? true : never;
};

type _CheckNoExtraPayloads = {
  [E in keyof EventPayloads]: E extends EventName ? true : never;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type _AssertEventsAreConsistent = _CheckAllEventsHavePayloads & _CheckNoExtraPayloads;
