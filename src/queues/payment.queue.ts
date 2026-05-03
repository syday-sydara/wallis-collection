// queues/payment.queue.ts
import { Queue } from "bullmq";
import { connection } from "../config/env";

// Shared constant — prevents name drift across producers/workers
export const PAYMENT_QUEUE_NAME = "payment";

/**
 * Payment Queue
 *
 * Notes:
 * - Uses Redis connection WITHOUT keyPrefix (BullMQ requirement)
 * - Uses queue-level prefix "bull:" to isolate BullMQ keys
 * - removeOnFail = false ensures failed payment jobs remain visible
 * - Payments require exponential backoff due to provider latency
 */
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

// ---------------------------------------------------------
// Queue-level observability (recommended improvement)
// ---------------------------------------------------------

paymentQueue.on("error", (err) => {
  console.error("[PAYMENT QUEUE ERROR]", err);
});

paymentQueue.on("waiting", (jobId) => {
  console.log(`[PAYMENT QUEUE] Job waiting: ${jobId}`);
});

paymentQueue.on("failed", (job, err) => {
  console.error(`[PAYMENT QUEUE] Job failed: ${job?.id}`, err);
});

paymentQueue.on("active", (job) => {
  console.log(`[PAYMENT QUEUE] Job active: ${job.id}`);
});

paymentQueue.on("completed", (job) => {
  console.log(`[PAYMENT QUEUE] Job completed: ${job.id}`);
});
