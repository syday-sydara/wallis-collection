// services/order.service.ts
import { prisma } from "../lib/prisma";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import { OrderProducer } from "../producers/order.producer";

export const OrderService = {
  async createOrder(input: {
    userId: string;
    items: { variantId: string; quantity: number }[];
    deliveryFee?: number;
    discount?: number;
    paymentMethod: string;
    addressId: string;
  }) {
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

      if (variants.length !== input.items.length) {
        throw new Error("One or more variants are invalid");
      }

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
          userId: input.userId,
          addressId: input.addressId,
          subtotal,
          totalAmount,
          currency: "NGN",
          paymentStatus: PaymentStatus.PENDING,
          status: OrderStatus.PENDING,
          deliveryFee,
          discount,
          items: { create: items },
          payments: {
            create: {
              provider: input.paymentMethod,
              amount: totalAmount,
              status: PaymentStatus.PENDING,
            },
          },
        },
        include: { items: true, payments: true },
      });

      // Emit checkout.started AFTER commit
      setImmediate(() => {
        OrderProducer.checkoutStarted(order);
      });

      return order;
    });
  },
};
