// workers/notification.worker.ts
import { Worker } from "bullmq";
import { connection } from "../config/redis";
import { Events } from "../events";
import { NotificationService } from "../services/notification.service";

export const notificationWorker = new Worker(
  "notification",
  async (job) => {
    const event = job.name as Events;
    const payload = job.data;

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
          console.warn("Unknown notification event:", event);
      }
    } catch (err) {
      console.error(`Notification worker failed for event ${event}`, err);
      throw err; // allow BullMQ retry logic to handle it
    }
  },
  { connection }
);
