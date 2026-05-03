// queues/whatsapp-retry.queue.ts
import { queue } from "../lib/queue";

export const WhatsAppRetryQueue = {
  enqueue(input) {
    return queue.add("whatsapp.retry", input, {
      attempts: 5,
      backoff: { type: "exponential", delay: 5000 },
    });
  },
};
