// queues/payment.queue.ts
import { Queue } from "bullmq";
import { redis } from "@/queues/core/connection";
import { logger } from "@/lib/logger";
import { Correlation } from "@/lib/correlation";
import { metrics } from "@/lib/metrics";

// Shared constant — prevents name drift across producers/workers
export const PAYMENT_QUEUE_NAME = "payment";

/**
 * Payment Queue
 *
 * Notes:
 * - Uses shared Redis connection WITHOUT keyPrefix (BullMQ requirement)
 * - Uses queue-level prefix "bull" to isolate BullMQ keys
 * - removeOnFail = false ensures failed payment jobs remain visible
 * - Payments require exponential backoff due to provider latency
 */
export const paymentQueue = new Queue(PAYMENT_QUEUE_NAME, {
  connection: redis,
  prefix: "bull",

  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 1500 },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

// ---------------------------------------------------------
// Queue-level observability (correlation-aware)
// ---------------------------------------------------------
paymentQueue.on("error", (err) => {
  const ctx = Correlation.get();
  logger.error("[PAYMENT QUEUE ERROR]", {
    ...ctx,
    error: err.message,
  });
  metrics.increment("queue.payment.error");
});

paymentQueue.on("waiting", (jobId) => {
  const ctx = Correlation.get();
  logger.info("[PAYMENT QUEUE] Job waiting", {
    ...ctx,
    jobId,
  });
  metrics.increment("queue.payment.waiting");
});

paymentQueue.on("active", (job) => {
  const ctx = Correlation.get();
  logger.info("[PAYMENT QUEUE] Job active", {
    ...ctx,
    jobId: job.id,
  });
  metrics.increment("queue.payment.active");
});

paymentQueue.on("completed", (job) => {
  const ctx = Correlation.get();
  logger.info("[PAYMENT QUEUE] Job completed", {
    ...ctx,
    jobId: job.id,
  });
  metrics.increment("queue.payment.completed");
});

paymentQueue.on("failed", (job, err) => {
  const ctx = Correlation.get();
  logger.error("[PAYMENT QUEUE] Job failed", {
    ...ctx,
    jobId: job?.id,
    error: err.message,
  });
  metrics.increment("queue.payment.failed");
});
