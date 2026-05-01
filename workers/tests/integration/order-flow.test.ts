import { prisma } from "../../src/prisma/client";
import { orderQueue } from "../../src/queues/order.queue";
import { paymentQueue } from "../../src/queues/payment.queue";
import { inventoryQueue } from "../../src/queues/inventory.queue";
import { notificationQueue } from "../../src/queues/notification.queue";

import "../../src/workers/order.worker";
import "../../src/workers/payment.worker";
import "../../src/workers/inventory.reserve.worker";
import "../../src/workers/inventory.consume.worker";
import "../../src/workers/notification.worker";

describe("Full Order Pipeline Integration Test", () => {
  let variant: any;

  beforeAll(async () => {
    await prisma.$connect();

    // Create product variant with stock
    variant = await prisma.productVariant.create({
      data: {
        name: "Test Variant",
        price: 5000,
        stockQty: 10,
      },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test("should process full order lifecycle", async () => {
    // 1. Create order
    const order = await prisma.order.create({
      data: {
        userId: "test-user",
        addressLine1: "123 Test Street",
        state: "Lagos",
        paymentMethod: "BANK_TRANSFER",
        items: {
          create: [
            {
              variantId: variant.id,
              quantity: 2,
              priceAtTime: 5000,
            },
          ],
        },
      },
      include: { items: true },
    });

    // 2. Emit order.created
    await orderQueue.add("order.created", { order });

    // Wait for reservation worker to run
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 3. Verify reservation created
    const reservations = await prisma.stockReservation.findMany({
      where: { orderId: order.id },
    });

    expect(reservations.length).toBe(1);
    expect(reservations[0].status).toBe("ACTIVE");

    // 4. Simulate payment success
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        provider: "BANK_TRANSFER",
        amount: order.totalAmount,
        status: "PENDING",
      },
    });

    await paymentQueue.add("payment.success", { payment });

    // Wait for payment + inventory.consume workers
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 5. Verify reservation consumed
    const consumed = await prisma.stockReservation.findFirst({
      where: { orderId: order.id },
    });

    expect(consumed.status).toBe("CONSUMED");

    // 6. Verify stock deducted
    const updatedVariant = await prisma.productVariant.findUnique({
      where: { id: variant.id },
    });

    expect(updatedVariant.stockQty).toBe(8);

    // 7. Verify order confirmed
    const updatedOrder = await prisma.order.findUnique({
      where: { id: order.id },
    });

    expect(updatedOrder.status).toBe("CONFIRMED");

    // 8. Simulate shipment
    await orderQueue.add("order.shipped", { orderId: order.id });

    await new Promise((resolve) => setTimeout(resolve, 300));

    const shippedOrder = await prisma.order.findUnique({
      where: { id: order.id },
    });

    expect(shippedOrder.status).toBe("SHIPPED");

    // 9. Simulate delivery
    await orderQueue.add("order.delivered", { orderId: order.id });

    await new Promise((resolve) => setTimeout(resolve, 300));

    const deliveredOrder = await prisma.order.findUnique({
      where: { id: order.id },
    });

    expect(deliveredOrder.status).toBe("DELIVERED");
  });
});
