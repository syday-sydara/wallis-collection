// producers/inventory.reserve.producer.ts
import { inventoryReserveQueue, INVENTORY_RESERVE_QUEUE_NAME } from "../queues/inventory.reserve.queue";

/**
 * InventoryReserveProducer
 *
 * Responsibilities:
 * - Emit reservation jobs for orders
 * - Deterministic jobId (orderId-first)
 * - Timestamp injection for ordering + debugging
 */
export const InventoryReserveProducer = {
  async reserve(orderId: string) {
    const jobId = `${INVENTORY_RESERVE_QUEUE_NAME}-${orderId}`;

    await inventoryReserveQueue.add(
      "reserve",
      {
        orderId,
        timestamp: new Date(),
      },
      {
        jobId,
        removeOnComplete: true,
        removeOnFail: false, // keep failed reservations for debugging
      }
    );

    console.log("[INVENTORY RESERVE PRODUCER] Enqueued reservation for order:", orderId);
  },
};
