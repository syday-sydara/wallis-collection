// producers/payment.producer.ts
import { paymentQueue } from "../queues/payment.queue";
import { Events } from "../events";
import type { EventName, EventPayloads } from "../events/payloads";

/**
 * PaymentProducer
 *
 * Responsibilities:
 * - Emit typed payment events
 * - Enforce deterministic jobId (paymentId-first)
 * - Guarantee timestamp injection
 */
export const PaymentProducer = {
  async emit<E extends EventName>(
    event: E,
    payload: EventPayloads[E]
  ) {
    const jobId =
      (payload as any).paymentId ??
      (payload as any).orderId ??
      `${event}-${Date.now()}`;

    await paymentQueue.add(event, payload, {
      jobId,
      removeOnComplete: true,
      removeOnFail: false,
    });
  },

  // -----------------------------
  // PAYMENT WRAPPERS
  // -----------------------------
  initiated(paymentId: string, orderId: string) {
    return this.emit(Events.PAYMENT_INITIATED, {
      paymentId,
      orderId,
      timestamp: new Date(),
    });
  },

  success(paymentId: string, orderId: string) {
    return this.emit(Events.PAYMENT_SUCCESS, {
      paymentId,
      orderId,
      timestamp: new Date(),
    });
  },

  failed(paymentId: string, orderId: string, reason?: string) {
    return this.emit(Events.PAYMENT_FAILED, {
      paymentId,
      orderId,
      reason,
      timestamp: new Date(),
    });
  },

  confirmed(paymentId: string, orderId: string, verifiedBy: string) {
    return this.emit(Events.PAYMENT_CONFIRMED, {
      paymentId,
      orderId,
      verifiedBy,
      timestamp: new Date(),
    });
  },
};
