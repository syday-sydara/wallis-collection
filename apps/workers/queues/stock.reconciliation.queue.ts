// queues/stock.reconciliation.queue.ts
import { Queue } from "bullmq";
import { connection } from "../config/redis";

// Shared constant — prevents name drift across producers/workers
export const STOCK_RECONCILIATION_QUEUE_NAME = "stock.reconciliation";

/**
 * Stock Reconciliation Queue
 *
 * Notes:
 * - Runs periodic reconciliation cycles
 * - Ensures stock consistency across variants + reservations
 * - Uses queue-level prefix "bull" to isolate BullMQ keys
 * - removeOnFail = false ensures failed cycles remain visible
 */
export const stockReconciliationQueue = new Queue(
  STOCK_RECONCILIATION_QUEUE_NAME,
  {
    connection,
    prefix: "bull", // isolates BullMQ keys in Redis (Nigeria‑first reliability)

    defaultJobOptions: {
      attempts: 3, // retry transient failures
      backoff: { type: "exponential", delay: 3000 },
      removeOnComplete: true,
      removeOnFail: false,
    },
  }
);

// ---------------------------------------------------------
// Queue-level observability
// ---------------------------------------------------------

stockReconciliationQueue.on("error", err => {
  console.error("[STOCK RECONCILIATION QUEUE ERROR]", err);
});

stockReconciliationQueue.on("waiting", jobId => {
  console.log(`[STOCK RECONCILIATION QUEUE] Job waiting: ${jobId}`);
});

stockReconciliationQueue.on("active", job => {
  console.log(`[STOCK RECONCILIATION QUEUE] Job active: ${job.id}`);
});

stockReconciliationQueue.on("completed", job => {
  console.log(`[STOCK RECONCILIATION QUEUE] Job completed: ${job.id}`);
});

stockReconciliationQueue.on("failed", (job, err) => {
  console.error(`[STOCK RECONCILIATION QUEUE] Job failed ${job?.id}`, err);
});
