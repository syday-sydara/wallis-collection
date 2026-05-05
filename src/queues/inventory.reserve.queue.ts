// queues/inventory.reserve.queue.ts
import { Queue } from "bullmq";
import { connection } from "../config/redis";

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
  connection,
  prefix: "bull", // isolates BullMQ keys in Redis (Nigeria‑first reliability)

  defaultJobOptions: {
    attempts: 5, // reservation is critical — retry more aggressively
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

// ---------------------------------------------------------
// Queue-level observability
// ---------------------------------------------------------

inventoryReserveQueue.on("error", err => {
  console.error("[INVENTORY RESERVE QUEUE ERROR]", err);
});

inventoryReserveQueue.on("waiting", jobId => {
  console.log(`[INVENTORY RESERVE QUEUE] Job waiting: ${jobId}`);
});

inventoryReserveQueue.on("active", job => {
  console.log(`[INVENTORY RESERVE QUEUE] Job active: ${job.id}`);
});

inventoryReserveQueue.on("completed", job => {
  console.log(`[INVENTORY RESERVE QUEUE] Job completed: ${job.id}`);
});

inventoryReserveQueue.on("failed", (job, err) => {
  console.error(`[INVENTORY RESERVE QUEUE] Job failed: ${job?.id}`, err);
});
