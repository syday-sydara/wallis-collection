// queues/payment.queue.ts
import { Queue } from "bullmq";
import { connection } from "../config/redis";

// Shared constant — prevents name drift across producers/workers
export const PAYMENT_QUEUE_NAME = "payment";

export const paymentQueue = new Queue(PAYMENT_QUEUE_NAME, {
  connection,
  prefix: "bull", // isolates BullMQ keys in Redis (Nigeria‑first reliability)

  defaultJobOptions: {
    attempts: 3, // retry transient failures
    backoff: { type: "exponential", delay: 1500 },
    removeOnComplete: true,
    removeOnFail: false, // keep failed jobs for debugging
  },
});
