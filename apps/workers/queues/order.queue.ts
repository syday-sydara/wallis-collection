// queues/order.queue.ts
import { Queue } from "bullmq";
import { redis } from "@/queues/core/connection";
import { logger } from "@/lib/logger";
import { Correlation } from "@/lib/correlation";
import { metrics } from "@/lib/metrics";

// Shared constant — prevents name drift across producers/workers
export const ORDER_QUEUE_NAME = "order";

/**
 * Order Queue
 *
 * Notes:
 * - Uses shared Redis connection WITHOUT keyPrefix (BullMQ requirement)
 * - Uses queue-level prefix "bull" to isolate BullMQ keys
 * - removeOnFail = false ensures failed order jobs remain visible
 * - Exponential backoff protects against transient provider failures
 */
export const orderQueue = new Queue(ORDER_QUEUE_NAME, {
  connection: redis,
  prefix: "bull",

  defaultJobOptions: {
    attempts: 3,
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
// Queue-level observability (correlation-aware)
// ---------------------------------------------------------
orderQueue.on("error", (err) => {
  const ctx = Correlation.get();
  logger.error("[ORDER QUEUE ERROR]", {
    ...ctx,
    error: err.message,
  });
  metrics.increment("queue.order.error");
});

orderQueue.on("waiting", (jobId) => {
  const ctx = Correlation.get();
  logger.info("[ORDER QUEUE] Job waiting", {
    ...ctx,
    jobId,
  });
  metrics.increment("queue.order.waiting");
});

orderQueue.on("active", (job) => {
  const ctx = Correlation.get();
  logger.info("[ORDER QUEUE] Job active", {
    ...ctx,
    jobId: job.id,
  });
  metrics.increment("queue.order.active");
});

orderQueue.on("completed", (job) => {
  const ctx = Correlation.get();
  logger.info("[ORDER QUEUE] Job completed", {
    ...ctx,
    jobId: job.id,
  });
  metrics.increment("queue.order.completed");
});

orderQueue.on("failed", (job, err) => {
  const ctx = Correlation.get();
  logger.error("[ORDER QUEUE] Job failed", {
    ...ctx,
    jobId: job?.id,
    error: err.message,
  });
  metrics.increment("queue.order.failed");
});
