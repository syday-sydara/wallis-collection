// queues/stock.reconciliation.queue.ts
import { Queue } from "bullmq";
import { redis } from "@/queues/core/connection";
import { logger } from "@/lib/logger";
import { Correlation } from "@/lib/correlation";
import { metrics } from "@/lib/metrics";

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
    connection: redis,
    prefix: "bull",

    defaultJobOptions: {
      attempts: 3,
      backoff: { type: "exponential", delay: 3000 },
      removeOnComplete: true,
      removeOnFail: false,
    },
  }
);

// ---------------------------------------------------------
// Queue-level observability (correlation-aware)
// ---------------------------------------------------------
stockReconciliationQueue.on("error", (err) => {
  const ctx = Correlation.get();
  logger.error("[STOCK RECONCILIATION QUEUE ERROR]", {
    ...ctx,
    error: err.message,
  });
  metrics.increment("queue.stockReconciliation.error");
});

stockReconciliationQueue.on("waiting", (jobId) => {
  const ctx = Correlation.get();
  logger.info("[STOCK RECONCILIATION QUEUE] Job waiting", {
    ...ctx,
    jobId,
  });
  metrics.increment("queue.stockReconciliation.waiting");
});

stockReconciliationQueue.on("active", (job) => {
  const ctx = Correlation.get();
  logger.info("[STOCK RECONCILIATION QUEUE] Job active", {
    ...ctx,
    jobId: job.id,
  });
  metrics.increment("queue.stockReconciliation.active");
});

stockReconciliationQueue.on("completed", (job) => {
  const ctx = Correlation.get();
  logger.info("[STOCK RECONCILIATION QUEUE] Job completed", {
    ...ctx,
    jobId: job.id,
  });
  metrics.increment("queue.stockReconciliation.completed");
});

stockReconciliationQueue.on("failed", (job, err) => {
  const ctx = Correlation.get();
  logger.error("[STOCK RECONCILIATION QUEUE] Job failed", {
    ...ctx,
    jobId: job?.id,
    error: err.message,
  });
  metrics.increment("queue.stockReconciliation.failed");
});
