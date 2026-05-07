// queues/inventory.queue.ts
import { Queue } from "bullmq";
import { redis } from "@/queues/core/connection";
import { logger } from "@/lib/logger";
import { Correlation } from "@/lib/correlation";
import { metrics } from "@/lib/metrics";

// Shared constant — prevents name drift across producers/workers
export const INVENTORY_RESERVE_QUEUE_NAME = "inventory.reserve";

/**
 * Inventory Reserve Queue
 *
 * Notes:
 * - Handles reservation of stock for orders
 * - Uses queue-level prefix "bull" to isolate BullMQ keys
 * - removeOnFail = false ensures failed reservations remain visible
 * - Exponential backoff protects against transient DB/Redis issues
 */
export const inventoryReserveQueue = new Queue(INVENTORY_RESERVE_QUEUE_NAME, {
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
inventoryReserveQueue.on("error", (err) => {
  const ctx = Correlation.get();
  logger.error("[INVENTORY RESERVE QUEUE ERROR]", {
    ...ctx,
    error: err.message,
  });
  metrics.increment("queue.inventoryReserve.error");
});

inventoryReserveQueue.on("waiting", (jobId) => {
  const ctx = Correlation.get();
  logger.info("[INVENTORY RESERVE QUEUE] Job waiting", {
    ...ctx,
    jobId,
  });
  metrics.increment("queue.inventoryReserve.waiting");
});

inventoryReserveQueue.on("active", (job) => {
  const ctx = Correlation.get();
  logger.info("[INVENTORY RESERVE QUEUE] Job active", {
    ...ctx,
    jobId: job.id,
  });
  metrics.increment("queue.inventoryReserve.active");
});

inventoryReserveQueue.on("completed", (job) => {
  const ctx = Correlation.get();
  logger.info("[INVENTORY RESERVE QUEUE] Job completed", {
    ...ctx,
    jobId: job.id,
  });
  metrics.increment("queue.inventoryReserve.completed");
});

inventoryReserveQueue.on("failed", (job, err) => {
  const ctx = Correlation.get();
  logger.error("[INVENTORY RESERVE QUEUE] Job failed", {
    ...ctx,
    jobId: job?.id,
    error: err.message,
  });
  metrics.increment("queue.inventoryReserve.failed");
});
