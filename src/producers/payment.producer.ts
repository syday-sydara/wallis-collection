import { paymentQueue } from "../queues/payment.queue";

export const PAYMENT_JOB = {
  SUCCESS: "payment.success",
  FAILED: "payment.failed",
} as const;

export const PaymentProducer = {
  async emitPaymentSuccess(payment: any) {
    await paymentQueue.add(
      PAYMENT_JOB.SUCCESS,
      { payment },
      {
        jobId: `payment-success-${payment.id}`,
      }
    );
  },
};
