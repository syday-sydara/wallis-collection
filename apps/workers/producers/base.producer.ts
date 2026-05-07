// producers/base.producer.ts
import { Queue } from "bullmq";
import { createEvent, type EventName, type EventPayloads } from "../events";
import { Correlation } from "../lib/correlation";

export class BaseEventProducer {
  constructor(private queue: Queue) {}

  async emit<E extends EventName>(name: E, payload: EventPayloads[E]) {
    const ctx = Correlation.get();

    const event = createEvent(name, payload, {
      requestId: ctx.requestId,
      traceId: ctx.traceId,
    });

    const jobId =
      `${name}-` +
      (payload as any).orderId ??
      (payload as any).paymentId ??
      (payload as any).reservationId ??
      (payload as any).sessionId ??
      (payload as any).logId ??
      crypto.randomUUID();

    await this.queue.add(name, event, {
      jobId,
      removeOnComplete: true,
      removeOnFail: false,
    });

    return event;
  }
}
