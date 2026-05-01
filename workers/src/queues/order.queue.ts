// queues/order.queue.ts
import { Queue } from "bullmq";
import { connection } from "../config/redis";

// Shared constant — prevents name drift across producers/workers
export const ORDER_QUEUE_NAME = "order";

export const orderQueue = new Queue(ORDER_QUEUE_NAME, {
  connection,
  prefix: "bull", // isolates BullMQ keys in Redis (Nigeria‑first reliability)

  defaultJobOptions: {
    attempts: 3, // retry transient failures
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: true,
    removeOnFail: false,
  },

  // Optional: rate limiter for flash‑sale spikes
  // limiter: {
  //   max: 50,
  //   duration: 1000,
  // },
});
