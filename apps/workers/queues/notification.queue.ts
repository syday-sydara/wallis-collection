// queues/notification.queue.ts
import { Queue } from "bullmq";
import { redis } from "@/queues/core/connection";
import { logger } from "@/lib/logger";
import { Correlation } from "@/lib/correlation";
import { metrics } from "@/lib/metrics";

// Shared constant — prevents name drift across producers/workers
export const NOTIFICATION_QUEUE_NAME = "notification";

/**
 * Notification Queue
 *
 * Notes:
 * - Uses shared Redis connection WITHOUT keyPrefix (BullMQ requirement)
 * - Uses queue-level prefix "bull" to isolate BullMQ keys
 * - removeOnFail = false ensures failed notifications remain visible
 * - Notifications often require retries due to provider throttling
 */
export const notificationQueue = new Queue(NOTIFICATION_QUEUE_NAME, {
  connection: redis,
  prefix: "bull",

  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },

  // Optional: rate limit to avoid provider throttling
  // limiter: {
  //   max: 20,
  //   duration: 1000,
  // },
});

// ---------------------------------------------------------
// Queue-level observability (correlation-aware)
// ---------------------------------------------------------
notificationQueue.on("error", (err) => {
  const ctx = Correlation.get();
  logger.error("[NOTIFICATION QUEUE ERROR]", {
    ...ctx,
    error: err.message,
  });
  metrics.increment("queue.notification.error");
});

notificationQueue.on("waiting", (jobId) => {
  const ctx = Correlation.get();
  logger.info("[NOTIFICATION QUEUE] Job waiting", {
    ...ctx,
    jobId,
  });
  metrics.increment("queue.notification.waiting");
});

notificationQueue.on("active", (job) => {
  const ctx = Correlation.get();
  logger.info("[NOTIFICATION QUEUE] Job active", {
    ...ctx,
    jobId: job.id,
  });
  metrics.increment("queue.notification.active");
});

notificationQueue.on("completed", (job) => {
  const ctx = Correlation.get();
  logger.info("[NOTIFICATION QUEUE] Job completed", {
    ...ctx,
    jobId: job.id,
  });
  metrics.increment("queue.notification.completed");
});

notificationQueue.on("failed", (job, err) => {
  const ctx = Correlation.get();
  logger.error("[NOTIFICATION QUEUE] Job failed", {
    ...ctx,
    jobId: job?.id,
    error: err.message,
  });
  metrics.increment("queue.notification.failed");
});
