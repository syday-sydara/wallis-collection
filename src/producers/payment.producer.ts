// producers/payment.producer.ts
import { paymentQueue } from "../queues/payment.queue";
import { Events } from "../events";
import type { EventPayloads, EventName } from "../events/payloads";

export const PaymentProducer = {
  async emit<Event extends EventName>(
    event: Event,
    payload: EventPayloads[Event]
  ) {
    await paymentQueue.add(event, payload, {
      jobId:
        `${event}-` +
        (payload.paymentId ??
          payload.orderId ??
          payload.reservationId ??
          payload.sessionId ??
          payload.logId ??
          "unknown"),
      removeOnComplete: true,
      removeOnFail: false,
    });
  },

  // -----------------------------
  // PAYMENT WRAPPERS
  // -----------------------------
  initiated(paymentId: string, orderId: string) {
    return this.emit(Events.PAYMENT_INITIATED, { paymentId, orderId });
  },

  success(paymentId: string, orderId: string) {
    return this.emit(Events.PAYMENT_SUCCESS, { paymentId, orderId });
  },

  failed(paymentId: string, orderId: string, reason?: string) {
    return this.emit(Events.PAYMENT_FAILED, { paymentId, orderId, reason });
  },

  confirmed(paymentId: string, orderId: string, verifiedBy: string) {
    return this.emit(Events.PAYMENT_CONFIRMED, {
      paymentId,
      orderId,
      verifiedBy,
    });
  },
};
