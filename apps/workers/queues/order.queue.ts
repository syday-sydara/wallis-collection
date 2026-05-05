// queues/order.queue.ts
import { Queue } from "bullmq";
import { connection } from "../config/redis";

// Shared constant — prevents name drift across producers/workers
export const ORDER_QUEUE_NAME = "order";

/**
 * Order Queue
 *
 * Notes:
 * - Uses Redis connection WITHOUT keyPrefix (BullMQ requirement)
 * - Uses queue-level prefix "bull:" to isolate BullMQ keys
 * - removeOnFail = false ensures failed order jobs remain visible
 * - Exponential backoff protects against transient provider failures
 */
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

// ---------------------------------------------------------
// Queue-level observability (recommended improvement)
// ---------------------------------------------------------

orderQueue.on("error", (err) => {
  console.error("[ORDER QUEUE ERROR]", err);
});

orderQueue.on("waiting", (jobId) => {
  console.log(`[ORDER QUEUE] Job waiting: ${jobId}`);
});

orderQueue.on("active", (job) => {
  console.log(`[ORDER QUEUE] Job active: ${job.id}`);
});

orderQueue.on("completed", (job) => {
  console.log(`[ORDER QUEUE] Job completed: ${job.id}`);
});

orderQueue.on("failed", (job, err) => {
  console.error(`[ORDER QUEUE] Job failed: ${job?.id}`, err);
});
