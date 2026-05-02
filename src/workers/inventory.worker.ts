// workers/inventory.reserve.worker.ts
import { Worker } from "bullmq";
import { INVENTORY_RESERVE_QUEUE_NAME } from "../queues/inventory.reserve.queue";
import { connection } from "../config/redis";
import { InventoryService } from "../services/inventory.service";

export const inventoryReserveWorker = new Worker(
  INVENTORY_RESERVE_QUEUE_NAME,
  async job => {
    const { orderId } = job.data;

    try {
      await InventoryService.reserveForOrder(orderId);

      console.log("[INVENTORY RESERVE] Reserved stock for order:", orderId);
    } catch (err) {
      console.error("[INVENTORY RESERVE] Failed to reserve stock:", orderId, err);
      throw err; // allow BullMQ retry
    }
  },
  {
    connection,
    concurrency: 5,
  }
);

// ---------------------------------------------------------
// Worker lifecycle logging
// ---------------------------------------------------------

inventoryReserveWorker.on("ready", () => {
  console.log("[INVENTORY RESERVE WORKER] Ready");
});

inventoryReserveWorker.on("active", job => {
  console.log(`[INVENTORY RESERVE WORKER] Active job ${job.id}`);
});

inventoryReserveWorker.on("completed", job => {
  console.log(`[INVENTORY RESERVE WORKER] Completed job ${job.id}`);
});

inventoryReserveWorker.on("failed", (job, err) => {
  console.error(`[INVENTORY RESERVE WORKER] Job failed ${job?.id}`, err);
});

inventoryReserveWorker.on("error", err => {
  console.error("[INVENTORY RESERVE WORKER] Worker error", err);
});

// ---------------------------------------------------------
// Graceful shutdown
// ---------------------------------------------------------

process.on("SIGTERM", async () => {
  console.log("[INVENTORY RESERVE WORKER] Shutting down...");
  await inventoryReserveWorker.close();
});
