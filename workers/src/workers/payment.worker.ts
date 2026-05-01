import { Worker } from "bullmq";
import { connection } from "../config/redis";
import { PAYMENT_JOB } from "../producers/payment.producer";
import { PaymentService } from "../services/payment.service";
import { PaymentProducer } from "../producers/payment.producer";

export const paymentWorker = new Worker(
  "payment",
  async (job) => {
    const { payment } = job.data;

    switch (job.name) {
      case PAYMENT_JOB.SUCCESS: {
        // Step 1: Mark payment as successful
        const updated = await PaymentService.handlePaymentSuccess(payment);

        // Step 2: Emit event for downstream workers
        await PaymentProducer.emitPaymentSuccess({
          paymentId: updated.id,
          orderId: updated.orderId,
          amount: updated.amount,
        });

        break;
      }

      case PAYMENT_JOB.FAILED: {
        await PaymentService.handlePaymentFailed(payment);
        await PaymentProducer.emitPaymentFailed({
          paymentId: payment.id,
          orderId: payment.orderId,
        });
        break;
      }
    }
  },
  { connection }
);
