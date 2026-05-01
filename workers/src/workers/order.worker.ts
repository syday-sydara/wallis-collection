import { Worker } from "bullmq";
import { connection } from "../config/redis";
import { inventoryQueue } from "../queues/inventory.queue";
import { notificationQueue } from "../queues/notification.queue";
import { ORDER_JOB } from "../producers/order.producer";

export const orderWorker = new Worker(
  "order",
  async (job) => {
    const { order } = job.data;

    switch (job.name) {
      case ORDER_JOB.CREATED:
        // Step 1: Reserve inventory
        await inventoryQueue.add("inventory.reserve", {
          orderId: order.id,
        });

        // Step 2: Notify customer
        await notificationQueue.add("notify.order.created", {
          orderId: order.id,
        });

        break;

      case ORDER_JOB.CONFIRMED:
        await notificationQueue.add("notify.order.confirmed", {
          orderId: order.id,
        });
        break;

      case ORDER_JOB.SHIPPED:
        await notificationQueue.add("notify.order.shipped", {
          orderId: order.id,
        });
        break;

      case ORDER_JOB.DELIVERED:
        await notificationQueue.add("notify.order.delivered", {
          orderId: order.id,
        });
        break;

      default:
        console.warn("Unknown order job:", job.name);
    }
  },
  { connection }
);
