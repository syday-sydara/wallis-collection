// workers/order.worker.ts
import { Worker } from "bullmq";
import { ORDER_QUEUE_NAME } from "../queues/domain/order.queue";
import { connection } from "../config/env";
import { Events } from "../events";
import type { EventPayloads, EventName } from "../events/payloads";

import { InventoryReserveProducer } from "../producers/inventory.reserve.producer";
import { NotificationProducer } from "../producers/notification.producer";

export const orderWorker = new Worker<EventPayloads[EventName]>(
  ORDER_QUEUE_NAME,
  async job => {
    const event = job.name as EventName;
    const payload = job.data as EventPayloads[typeof event];

    try {
      switch (event) {
        case Events.ORDER_CREATED: {
          const { orderId } = payload;

          // Reserve inventory via producer
          await InventoryReserveProducer.reserve(orderId);

          // Notify customer
          await NotificationProducer.orderCreated(orderId);

          break;
        }

        case Events.ORDER_CONFIRMED: {
          const { orderId, actor } = payload;

          await NotificationProducer.orderConfirmed(orderId, actor);
          break;
        }

        case Events.ORDER_SHIPPED: {
          const { orderId, shipmentId } = payload;

          await NotificationProducer.orderShipped(orderId, shipmentId);
          break;
        }

        case Events.ORDER_DELIVERED: {
          const { orderId } = payload;

          await NotificationProducer.orderDelivered(orderId);
          break;
        }

        case Events.ORDER_FAILED_DELIVERY: {
          const { orderId, reason } = payload;

          await NotificationProducer.orderFailedDelivery(orderId, reason);
          break;
        }

        case Events.ORDER_RETURNED: {
          const { orderId, reason } = payload;

          await NotificationProducer.orderReturned(orderId, reason);
          break;
        }

        case Events.ORDER_CANCELLED: {
          const { orderId, actor, reason } = payload;

          await NotificationProducer.orderCancelled(orderId, actor, reason);
          break;
        }

        default:
          console.warn("[ORDER WORKER] Unhandled event:", event);
      }
    } catch (err) {
      console.error(`[ORDER WORKER] Error processing ${event}`, err);
      throw err; // allow BullMQ retry
    }
  },
  {
    connection,
    concurrency: 10,
  }
);

// ---------------------------------------------------------
// Worker lifecycle logging
// ---------------------------------------------------------

orderWorker.on("ready", () => {
  console.log("[ORDER WORKER] Ready");
});

orderWorker.on("active", job => {
  console.log(`[ORDER WORKER] Active job ${job.id}`);
});

orderWorker.on("completed", job => {
  console.log(`[ORDER WORKER] Completed job ${job.id}`);
});

orderWorker.on("failed", (job, err) => {
  console.error(`[ORDER WORKER] Job failed ${job?.id}`, err);
});

orderWorker.on("error", err => {
  console.error("[ORDER WORKER] Worker error", err);
});

// ---------------------------------------------------------
// Graceful shutdown
// ---------------------------------------------------------

process.on("SIGTERM", async () => {
  console.log("[ORDER WORKER] Shutting down...");
  await orderWorker.close();
});
