// producers/order.producer.ts
import { orderQueue } from "../queues/order.queue";
import { Events } from "../events/events";
import type { EventPayloads } from "../events/payloads";

export const OrderProducer = {
  async emit<Event extends keyof EventPayloads>(
    event: Event,
    payload: EventPayloads[Event]
  ) {
    await orderQueue.add(event, payload, {
      jobId: `${event}-${payload.orderId ?? payload.reservationId ?? payload.paymentId ?? payload.sessionId}`,
      removeOnComplete: true,
      removeOnFail: false,
    });
  },

  // -----------------------------
  // ORDER LIFECYCLE
  // -----------------------------
  created(orderId: string) {
    return this.emit(Events.ORDER_CREATED, { orderId });
  },

  confirmed(orderId: string, actor: string) {
    return this.emit(Events.ORDER_CONFIRMED, { orderId, actor });
  },

  processing(orderId: string, actor: string) {
    return this.emit(Events.ORDER_PROCESSING, { orderId, actor });
  },

  shipped(orderId: string, shipmentId: string) {
    return this.emit(Events.ORDER_SHIPPED, { orderId, shipmentId });
  },

  delivered(orderId: string) {
    return this.emit(Events.ORDER_DELIVERED, { orderId });
  },

  failedDelivery(orderId: string, reason?: string) {
    return this.emit(Events.ORDER_FAILED_DELIVERY, { orderId, reason });
  },

  returned(orderId: string, reason?: string) {
    return this.emit(Events.ORDER_RETURNED, { orderId, reason });
  },

  cancelled(orderId: string, actor: string, reason?: string) {
    return this.emit(Events.ORDER_CANCELLED, { orderId, actor, reason });
  },

  // -----------------------------
  // PAYMENTS
  // -----------------------------
  paymentInitiated(orderId: string, paymentId: string) {
    return this.emit(Events.PAYMENT_INITIATED, { orderId, paymentId });
  },

  paymentSuccess(orderId: string, paymentId: string) {
    return this.emit(Events.PAYMENT_SUCCESS, { orderId, paymentId });
  },

  paymentFailed(orderId: string, paymentId: string, reason?: string) {
    return this.emit(Events.PAYMENT_FAILED, { orderId, paymentId, reason });
  },

  paymentConfirmed(orderId: string, paymentId: string, actor: string) {
    return this.emit(Events.PAYMENT_CONFIRMED, { orderId, paymentId, actor });
  },

  // -----------------------------
  // INVENTORY
  // -----------------------------
  stockReserved(reservationId: string, variantId: string, orderId?: string) {
    return this.emit(Events.STOCK_RESERVED, { reservationId, variantId, orderId });
  },

  stockReleased(reservationId: string, reason?: string) {
    return this.emit(Events.STOCK_RELEASED, { reservationId, reason });
  },

  stockConsumed(reservationId: string, orderId: string) {
    return this.emit(Events.STOCK_CONSUMED, { reservationId, orderId });
  },

  // -----------------------------
  // WHATSAPP
  // -----------------------------
  whatsappSessionStarted(sessionId: string, phoneNumber: string) {
    return this.emit(Events.WHATSAPP_SESSION_STARTED, { sessionId, phoneNumber });
  },

  whatsappSessionUpdated(sessionId: string, lastMessageAt: string) {
    return this.emit(Events.WHATSAPP_SESSION_UPDATED, { sessionId, lastMessageAt });
  },

  whatsappMessageReceived(sessionId: string, message: string) {
    return this.emit(Events.WHATSAPP_MESSAGE_RECEIVED, { sessionId, message });
  },

  whatsappMessageSent(sessionId: string, message: string) {
    return this.emit(Events.WHATSAPP_MESSAGE_SENT, { sessionId, message });
  },

  // -----------------------------
  // AUDIT
  // -----------------------------
  auditLogCreated(logId: string) {
    return this.emit(Events.AUDIT_LOG_CREATED, { logId });
  },
};
