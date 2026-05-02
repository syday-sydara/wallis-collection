// producers/order.producer.ts
import { orderQueue, ORDER_QUEUE_NAME } from "../queues/order.queue";
import { Events } from "../events/events";
import type { EventName, EventPayloads } from "../events/payloads";

/**
 * OrderProducer
 *
 * Responsibilities:
 * - Emit typed order, payment, inventory, WhatsApp, and audit events
 * - Enforce deterministic jobId for idempotency
 * - Guarantee timestamp injection
 */
export const OrderProducer = {
  async emit<E extends EventName>(
    event: E,
    payload: EventPayloads[E]
  ) {
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
  created(orderId: string) {
    return this.emit(Events.ORDER_CREATED, {
      orderId,
      timestamp: new Date(),
    });
  },

  confirmed(orderId: string, actor: string) {
    return this.emit(Events.ORDER_CONFIRMED, {
      orderId,
      actor,
      timestamp: new Date(),
    });
  },

  processing(orderId: string, actor: string) {
    return this.emit(Events.ORDER_PROCESSING, {
      orderId,
      actor,
      timestamp: new Date(),
    });
  },

  shipped(orderId: string, shipmentId: string) {
    return this.emit(Events.ORDER_SHIPPED, {
      orderId,
      shipmentId,
      timestamp: new Date(),
    });
  },

  delivered(orderId: string) {
    return this.emit(Events.ORDER_DELIVERED, {
      orderId,
      timestamp: new Date(),
    });
  },

  failedDelivery(orderId: string, reason?: string) {
    return this.emit(Events.ORDER_FAILED_DELIVERY, {
      orderId,
      reason,
      timestamp: new Date(),
    });
  },

  returned(orderId: string, reason?: string) {
    return this.emit(Events.ORDER_RETURNED, {
      orderId,
      reason,
      timestamp: new Date(),
    });
  },

  cancelled(orderId: string, actor: string, reason?: string) {
    return this.emit(Events.ORDER_CANCELLED, {
      orderId,
      actor,
      reason,
      timestamp: new Date(),
    });
  },

  // -----------------------------
  // PAYMENTS
  // -----------------------------
  paymentInitiated(orderId: string, paymentId: string) {
    return this.emit(Events.PAYMENT_INITIATED, {
      orderId,
      paymentId,
      timestamp: new Date(),
    });
  },

  paymentSuccess(orderId: string, paymentId: string) {
    return this.emit(Events.PAYMENT_SUCCESS, {
      orderId,
      paymentId,
      timestamp: new Date(),
    });
  },

  paymentFailed(orderId: string, paymentId: string, reason?: string) {
    return this.emit(Events.PAYMENT_FAILED, {
      orderId,
      paymentId,
      reason,
      timestamp: new Date(),
    });
  },

  paymentConfirmed(orderId: string, paymentId: string, actor: string) {
    return this.emit(Events.PAYMENT_CONFIRMED, {
      orderId,
      paymentId,
      actor,
      timestamp: new Date(),
    });
  },

  // -----------------------------
  // INVENTORY
  // -----------------------------
  stockReserved(reservationId: string, variantId: string, orderId?: string) {
    return this.emit(Events.STOCK_RESERVED, {
      reservationId,
      variantId,
      orderId,
      timestamp: new Date(),
    });
  },

  stockReleased(reservationId: string, reason?: string) {
    return this.emit(Events.STOCK_RELEASED, {
      reservationId,
      reason,
      timestamp: new Date(),
    });
  },

  stockConsumed(reservationId: string, orderId: string) {
    return this.emit(Events.STOCK_CONSUMED, {
      reservationId,
      orderId,
      timestamp: new Date(),
    });
  },

  // -----------------------------
  // WHATSAPP
  // -----------------------------
  whatsappSessionStarted(sessionId: string, phoneNumber: string) {
    return this.emit(Events.WHATSAPP_SESSION_STARTED, {
      sessionId,
      phoneNumber,
      timestamp: new Date(),
    });
  },

  whatsappSessionUpdated(sessionId: string, lastMessageAt: string) {
    return this.emit(Events.WHATSAPP_SESSION_UPDATED, {
      sessionId,
      lastMessageAt,
      timestamp: new Date(),
    });
  },

  whatsappMessageReceived(sessionId: string, message: string) {
    return this.emit(Events.WHATSAPP_MESSAGE_RECEIVED, {
      sessionId,
      message,
      timestamp: new Date(),
    });
  },

  whatsappMessageSent(sessionId: string, message: string) {
    return this.emit(Events.WHATSAPP_MESSAGE_SENT, {
      sessionId,
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
