import { Worker } from "bullmq";
import { connection } from "../config/redis";
import { PAYMENT_JOB } from "../producers/payment.producer";
import { PaymentService } from "../services/payment.service";
import { OrderStateService } from "../services/order-state.service";

export const paymentWorker = new Worker(
  "payment",
  async (job) => {
    const { payment } = job.data;

    switch (job.name) {
      case PAYMENT_JOB.SUCCESS:
        await PaymentService.handlePaymentSuccess(payment);
        await OrderStateService.transition(payment.orderId, "PAID");
        break;
    }
  },
  { connection }
);
