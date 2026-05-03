// workers/inventory.reserve.worker.ts
import { Worker } from "bullmq";
import { connection } from "../config/redis";
import { InventoryService } from "../services/inventory.service";

export const inventoryReserveWorker = new Worker(
  "inventory.reserve",
  async (job) => {
    const { orderId } = job.data;

    await InventoryService.reserveForOrder(orderId);
  },
  { connection }
);
