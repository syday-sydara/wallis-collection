// queues/sms-retry.queue.ts
import { queue } from "./lib/queue";

export const SmsRetryQueue = {
  enqueue(input) {
    return queue.add("sms.retry", input, {
      attempts: 5,
      backoff: { type: "exponential", delay: 5000 },
    });
  },
};
