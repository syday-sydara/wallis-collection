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
        await inventoryQueue.add("inventory.reserve", { order });
        await notificationQueue.add("notify.customer.orderCreated", { order });
        break;
    }
  },
  { connection }
);
