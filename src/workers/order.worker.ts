// workers/order.worker.ts
import { Worker } from "bullmq";
import { connection } from "../config/redis";
import { Events } from "../events";
import { inventoryQueue } from "../queues/inventory.queue";
import { notificationQueue } from "../queues/notification.queue";

export const orderWorker = new Worker(
  "order",
  async (job) => {
    const event = job.name as Events;

    switch (event) {
      case Events.ORDER_CREATED: {
        const { orderId } = job.data;

        // Reserve inventory
        await inventoryQueue.add("inventory.reserve", { orderId });

        // Notify customer
        await notificationQueue.add("notify.order.created", { orderId });

        break;
      }

      case Events.ORDER_CONFIRMED: {
        const { orderId } = job.data;

        await notificationQueue.add("notify.order.confirmed", { orderId });
        break;
      }

      case Events.ORDER_SHIPPED: {
        const { orderId } = job.data;

        await notificationQueue.add("notify.order.shipped", { orderId });
        break;
      }

      case Events.ORDER_DELIVERED: {
        const { orderId } = job.data;

        await notificationQueue.add("notify.order.delivered", { orderId });
        break;
      }

      default:
        console.warn("Unknown order event:", event);
    }
  },
  { connection }
);
