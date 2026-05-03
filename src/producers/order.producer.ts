// producers/order.producer.ts
import { orderQueue } from "../queues/domain/order.queue";
import { Events } from "../events/events";
import type { Actor, EventName, EventPayloads } from "../events/payloads";

/**
 * OrderProducer
 *
 * Responsibilities:
 * - Emit typed order, payment, inventory, WhatsApp, and audit events
 * - Enforce deterministic jobId for idempotency
 * - Guarantee timestamp injection
 */
export const OrderProducer = {
  async emit<E extends EventName>(event: E, payload: EventPayloads[E]) {
    const jobId =
      (payload as any).orderId ??
      (payload as any).reservationId ??
      (payload as any).paymentId ??
      (payload as any).sessionId ??
      `${event}-${Date.now()}`;

    await orderQueue.add(event, payload, {
      jobId,
      removeOnComplete: true,
      removeOnFail: false,
    });
  },

  // -----------------------------
  // ORDER LIFECYCLE
  // -----------------------------
  orderCreated(data: {
    orderId: string;
    customerId?: string;
    sessionId?: string;
    customerPhone?: string;
    timestamp: Date;
  }) {
    return this.emit(Events.ORDER_CREATED, data);
  },

  orderConfirmed(data: {
    orderId: string;
    actor: Actor;
    sessionId?: string;
    customerPhone?: string;
    timestamp: Date;
  }) {
    return this.emit(Events.ORDER_CONFIRMED, data);
  },

  orderProcessing(data: {
    orderId: string;
    actor: Actor;
    sessionId?: string;
    customerPhone?: string;
    timestamp: Date;
  }) {
    return this.emit(Events.ORDER_PROCESSING, data);
  },

  orderShipped(data: {
    orderId: string;
    shipmentId: string;
    sessionId?: string;
    customerPhone?: string;
    timestamp: Date;
  }) {
    return this.emit(Events.ORDER_SHIPPED, data);
  },

  orderDelivered(data: {
    orderId: string;
    deliveredAt: Date;
    sessionId?: string;
    customerPhone?: string;
    timestamp: Date;
  }) {
    return this.emit(Events.ORDER_DELIVERED, data);
  },

  orderFailedDelivery(data: {
    orderId: string;
    reason?: string;
    sessionId?: string;
    customerPhone?: string;
    timestamp: Date;
  }) {
    return this.emit(Events.ORDER_FAILED_DELIVERY, data);
  },

  orderReturned(data: {
    orderId: string;
    reason?: string;
    sessionId?: string;
    customerPhone?: string;
    timestamp: Date;
  }) {
    return this.emit(Events.ORDER_RETURNED, data);
  },

  orderCancelled(data: {
    orderId: string;
    actor: Actor;
    reason?: string;
    sessionId?: string;
    customerPhone?: string;
    timestamp: Date;
  }) {
    return this.emit(Events.ORDER_CANCELLED, data);
  },

  // -----------------------------
  // PAYMENTS
  // -----------------------------
  paymentInitiated(data: {
    orderId: string;
    paymentId: string;
    sessionId?: string;
    customerPhone?: string;
    timestamp: Date;
  }) {
    return this.emit(Events.PAYMENT_INITIATED, data);
  },

  paymentSuccess(data: {
    orderId: string;
    paymentId: string;
    sessionId?: string;
    customerPhone?: string;
    timestamp: Date;
  }) {
    return this.emit(Events.PAYMENT_SUCCESS, data);
  },

  paymentFailed(data: {
    orderId: string;
    paymentId: string;
    reason?: string;
    sessionId?: string;
    customerPhone?: string;
    timestamp: Date;
  }) {
    return this.emit(Events.PAYMENT_FAILED, data);
  },

  paymentConfirmed(data: {
    orderId: string;
    paymentId: string;
    actor: Actor;
    sessionId?: string;
    customerPhone?: string;
    timestamp: Date;
  }) {
    return this.emit(Events.PAYMENT_CONFIRMED, data);
  },

  // -----------------------------
  // INVENTORY
  // -----------------------------
  stockReserved(data: {
    reservationId: string;
    variantId: string;
    quantity: number;
    orderId?: string;
    sessionId?: string;
    customerPhone?: string;
    timestamp: Date;
  }) {
    return this.emit(Events.STOCK_RESERVED, data);
  },

  stockReleased(data: {
    reservationId: string;
    reason?: string;
    sessionId?: string;
    customerPhone?: string;
    timestamp: Date;
  }) {
    return this.emit(Events.STOCK_RELEASED, data);
  },

  stockConsumed(data: {
    reservationId: string;
    orderId: string;
    sessionId?: string;
    customerPhone?: string;
    timestamp: Date;
  }) {
    return this.emit(Events.STOCK_CONSUMED, data);
  },

  // -----------------------------
  // WHATSAPP
  // -----------------------------
  whatsappSessionStarted(sessionId: string, phoneNumber: string) {
    return this.emit(Events.WHATSAPP_SESSION_STARTED, {
      sessionId,
      phone: phoneNumber,
      timestamp: new Date(),
    });
  },

  whatsappSessionUpdated(sessionId: string, lastMessageAt: string) {
    return this.emit(Events.WHATSAPP_SESSION_UPDATED, {
      sessionId,
      lastMessageAt: new Date(lastMessageAt),
      timestamp: new Date(),
    });
  },

  whatsappMessageReceived(sessionId: string, messageId: string, message: string) {
    return this.emit(Events.WHATSAPP_MESSAGE_RECEIVED, {
      sessionId,
      messageId,
      message,
      timestamp: new Date(),
    });
  },

  whatsappMessageSent(sessionId: string, messageId: string, message: string) {
    return this.emit(Events.WHATSAPP_MESSAGE_SENT, {
      sessionId,
      messageId,
      message,
      timestamp: new Date(),
    });
  },

  // -----------------------------
  // AUDIT
  // -----------------------------
  auditLogCreated(logId: string) {
    return this.emit(Events.AUDIT_LOG_CREATED, {
      logId,
      timestamp: new Date(),
    });
  },
};
