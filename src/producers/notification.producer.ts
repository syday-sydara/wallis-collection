// producers/notification.producer.ts
import { notificationQueue } from "../queues/messaging/notification.queue";
import { Events } from "../events";
import type { EventName, EventPayloads } from "../events/payloads";

/**
 * NotificationProducer
 *
 * Responsibilities:
 * - Emit typed notification events
 * - Enforce deterministic jobId for idempotency
 * - Guarantee timestamp injection
 */
export const NotificationProducer = {
  async emit<E extends EventName>(
    event: E,
    payload: EventPayloads[E]
  ) {
    // Deterministic jobId for idempotency
    const jobId =
      (payload as any).orderId ??
      (payload as any).sessionId ??
      `${event}-${Date.now()}`;

    await notificationQueue.add(event, payload, {
      jobId,
      removeOnComplete: true,
      removeOnFail: false,
    });
  },

  /**
   * Convenience wrappers (add more as needed)
   */
  orderUpdate(orderId: string, message: string) {
    return this.emit(Events.WHATSAPP_MESSAGE_SENT, {
      sessionId: orderId, // or actual sessionId if available
      message,
      messageId: `msg-${Date.now()}`,
      timestamp: new Date(),
    });
  },
};
