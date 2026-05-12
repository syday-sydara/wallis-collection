// queues/reservation.expiry.queue.ts
import { Queue } from "bullmq";
import { redis } from "@/queues/core/connection";
import { logger } from "@/lib/logger";
import { Correlation } from "@/lib/correlation";
import { metrics } from "@/lib/metrics";

// Shared constant — prevents name drift across producers/workers
export const RESERVATION_EXPIRY_QUEUE_NAME = "reservation.expiry";

/**
 * Reservation Expiry Queue
 *
 * Notes:
 * - Handles expiration of stock reservations
 * - Uses queue-level prefix "bull" to isolate BullMQ keys
 * - removeOnFail = false ensures failed expiry jobs remain visible
 * - Exponential backoff protects against transient DB/Redis issues
 */
export const reservationExpiryQueue = new Queue(RESERVATION_EXPIRY_QUEUE_NAME, {
  connection: redis,
  prefix: "bull",

  defaultJobOptions: {
    attempts: 5,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

// ---------------------------------------------------------
// Queue-level observability (correlation-aware)
// ---------------------------------------------------------
reservationExpiryQueue.on("error", (err) => {
  const ctx = Correlation.get();
  logger.error("[RESERVATION EXPIRY QUEUE ERROR]", {
    ...ctx,
    error: err.message,
  });
  metrics.increment("queue.reservationExpiry.error");
});

reservationExpiryQueue.on("waiting", (jobId) => {
  const ctx = Correlation.get();
  logger.info("[RESERVATION EXPIRY QUEUE] Job waiting", {
    ...ctx,
    jobId,
  });
  metrics.increment("queue.reservationExpiry.waiting");
});

reservationExpiryQueue.on("active", (job) => {
  const ctx = Correlation.get();
  logger.info("[RESERVATION EXPIRY QUEUE] Job active", {
    ...ctx,
    jobId: job.id,
  });
  metrics.increment("queue.reservationExpiry.active");
});

reservationExpiryQueue.on("completed", (job) => {
  const ctx = Correlation.get();
  logger.info("[RESERVATION EXPIRY QUEUE] Job completed", {
    ...ctx,
    jobId: job.id,
  });
  metrics.increment("queue.reservationExpiry.completed");
});

reservationExpiryQueue.on("failed", (job, err) => {
  const ctx = Correlation.get();
  logger.error("[RESERVATION EXPIRY QUEUE] Job failed", {
    ...ctx,
    jobId: job?.id,
    error: err.message,
  });
  metrics.increment("queue.reservationExpiry.failed");
});
