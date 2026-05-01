import { Worker } from "bullmq";
import { connection } from "../config/redis";
import { NotificationService } from "../services/notification.service";

export const notificationWorker = new Worker(
  "notification",
  async (job) => {
    const { type, payload } = job.data;

    switch (type) {
      case "order.confirmed":
        await NotificationService.sendOrderConfirmed(payload);
        break;

      case "order.shipped":
        await NotificationService.sendOrderShipped(payload);
        break;

      case "order.delivered":
        await NotificationService.sendOrderDelivered(payload);
        break;

      case "payment.success":
        await NotificationService.sendPaymentSuccess(payload);
        break;

      case "payment.failed":
        await NotificationService.sendPaymentFailed(payload);
        break;

      case "shipment.created":
        await NotificationService.sendShipmentCreated(payload);
        break;

      case "shipment.failed_delivery":
        await NotificationService.sendFailedDelivery(payload);
        break;

      default:
        console.warn("Unknown notification type:", type);
    }
  },
  { connection }
);
