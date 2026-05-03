// workers/payment.worker.ts
import { Worker } from "bullmq";
import { connection } from "../config/env";
import { Events } from "../events";
import { PaymentService } from "../services/payment.service";

export const paymentWorker = new Worker(
  "payment",
  async (job) => {
    const event = job.name as Events;

    switch (event) {
      case Events.PAYMENT_SUCCESS: {
        const { paymentId } = job.data;

        // Mark payment as successful (idempotent)
        await PaymentService.confirmPayment(paymentId);

        break;
      }

      case Events.PAYMENT_FAILED: {
        const { paymentId, reason } = job.data;

        await PaymentService.failPayment(paymentId, reason);

        break;
      }

      default:
        throw new Error(`Unhandled payment event: ${event}`);
    }
  },
  { connection }
);
