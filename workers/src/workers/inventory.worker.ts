import { Worker } from "bullmq";
import { connection } from "../config/redis";
import { InventoryService } from "../services/inventory.service";
import { OrderStateService } from "../services/order-state.service";

export const inventoryWorker = new Worker(
  "inventory",
  async (job) => {
    const { order } = job.data;

    if (job.name === "inventory.reserve") {
      for (const item of order.items) {
        await InventoryService.reserveStock(item.variantId, item.quantity);
      }

      await OrderStateService.transition(order.id, "CONFIRMED");
    }
  },
  { connection }
);
