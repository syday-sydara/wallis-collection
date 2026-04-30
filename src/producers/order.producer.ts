import { orderQueue } from "../queues/order.queue";

export const ORDER_JOB = {
  CREATED: "order.created",
  CONFIRMED: "order.confirmed",
} as const;

export const OrderProducer = {
  async emitOrderCreated(order: any) {
    await orderQueue.add(
      ORDER_JOB.CREATED,
      { order },
      {
        jobId: `order-created-${order.id}`,
      }
    );
  },
};
