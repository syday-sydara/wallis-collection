import { Worker } from "bullmq";
import { connection } from "../config/redis";
import { InventoryService } from "../services/inventory.service";
import { InventoryProducer } from "../queues/inventory.producer";

export const inventoryReserveWorker = new Worker(
  "inventory",
  async (job) => {
    if (job.name !== "inventory.reserve") return;

    const { order } = job.data;

    // Reserve stock for each item
    for (const item of order.items) {
      await InventoryService.reserveStock(
        item.variantId,
        item.quantity,
        order.id
      );
    }

    // Emit event for next stage in pipeline
    await InventoryProducer.emitReservationCreated({
      orderId: order.id,
    });
  },
  { connection }
);
