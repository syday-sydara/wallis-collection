// workers/notification.worker.ts
import { Worker } from "bullmq";
import { connection } from "../config/redis";
import { NOTIFICATION_QUEUE_NAME } from "../queues/notification.queue";
import { Events } from "../events";
import type { EventName, EventPayloads } from "../events/payloads";
import { NotificationService } from "../services/notification.service";

export const notificationWorker = new Worker<EventPayloads[EventName]>(
  NOTIFICATION_QUEUE_NAME,
  async job => {
    const event = job.name as EventName;
    const payload = job.data as EventPayloads[typeof event];

    try {
      switch (event) {
        case Events.ORDER_CONFIRMED:
          await NotificationService.sendOrderConfirmed(payload);
          break;

        case Events.ORDER_SHIPPED:
          await NotificationService.sendOrderShipped(payload);
          break;

        case Events.ORDER_DELIVERED:
          await NotificationService.sendOrderDelivered(payload);
          break;

        case Events.PAYMENT_SUCCESS:
          await NotificationService.sendPaymentSuccess(payload);
          break;

        case Events.PAYMENT_FAILED:
          await NotificationService.sendPaymentFailed(payload);
          break;

        case Events.SHIPMENT_CREATED:
          await NotificationService.sendShipmentCreated(payload);
          break;

        case Events.SHIPMENT_FAILED_DELIVERY:
          await NotificationService.sendFailedDelivery(payload);
          break;

        default:
          console.warn("[NOTIFICATION WORKER] Unhandled event:", event);
      }
    } catch (err) {
      console.error(`[NOTIFICATION WORKER] Error processing ${event}`, err);
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

notificationWorker.on("ready", () => {
  console.log("[NOTIFICATION WORKER] Ready");
});

notificationWorker.on("active", job => {
  console.log(`[NOTIFICATION WORKER] Active job ${job.id}`);
});

notificationWorker.on("completed", job => {
  console.log(`[NOTIFICATION WORKER] Completed job ${job.id}`);
});

notificationWorker.on("failed", (job, err) => {
  console.error(`[NOTIFICATION WORKER] Job failed ${job?.id}`, err);
});

notificationWorker.on("error", err => {
  console.error("[NOTIFICATION WORKER] Worker error", err);
});

// ---------------------------------------------------------
// Graceful shutdown
// ---------------------------------------------------------

process.on("SIGTERM", async () => {
  console.log("[NOTIFICATION WORKER] Shutting down...");
  await notificationWorker.close();
});
