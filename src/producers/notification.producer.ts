import { notificationQueue } from "../queues/notification.queue";
import { Events } from "../events";
import type { EventPayloads } from "../events/payloads";

export const NotificationProducer = {
  async emit<Event extends keyof EventPayloads>(
    event: Event,
    payload: EventPayloads[Event]
  ) {
    await notificationQueue.add(event, payload, {
      jobId: `${event}-${payload.orderId ?? payload.sessionId ?? "unknown"}`,
    });
  },
};
