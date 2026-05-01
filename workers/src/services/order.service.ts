import { prisma } from "../prisma/client";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import { OrderProducer } from "./queues/order.producer";

export const OrderService = {
  async createOrder(input) {
    return prisma.$transaction(async (tx) => {
      if (!input.items.length) {
        throw new Error("Order must have items");
      }

      // Fetch variants
      const variants = await tx.productVariant.findMany({
        where: {
          id: { in: input.items.map(i => i.variantId) },
        },
      });

      const variantMap = new Map(variants.map(v => [v.id, v]));

      // Build order items
      const items = input.items.map(i => {
        const variant = variantMap.get(i.variantId);
        if (!variant) throw new Error("Invalid variant");

        return {
          variantId: i.variantId,
          quantity: i.quantity,
          priceAtTime: variant.price,
        };
      });

      // Calculate totals
      const subtotal = items.reduce(
        (sum, i) => sum + i.priceAtTime * i.quantity,
        0
      );

      const deliveryFee = input.deliveryFee ?? 0;
      const discount = input.discount ?? 0;

      const totalAmount = subtotal + deliveryFee - discount;

      // Create order
      const order = await tx.order.create({
        data: {
          ...input,
          subtotal,
          totalAmount,
          currency: "NGN",
          paymentStatus: PaymentStatus.PENDING,
          status: OrderStatus.PENDING,
          items: { create: items },
          payments: {
            create: {
              provider: input.paymentMethod,
              amount: totalAmount,
              status: PaymentStatus.PENDING,
            },
          },
        },
        include: { items: true },
      });

      // Emit checkout.started AFTER commit
      setImmediate(() => {
        OrderProducer.emitCheckoutStarted(order);
      });

      return order;
    });
  },
};
