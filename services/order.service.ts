import { prisma } from "../prisma/client";
import { OrderStatus, PaymentProvider, PaymentStatus } from "@prisma/client";

export const OrderService = {
  async createOrder(input: {
    userId?: string;
    phoneNumber: string;
    addressLine1: string;
    addressLine2?: string;
    city?: string;
    state: string;
    lga?: string;
    landmark?: string;
    deliveryNote?: string;
    items: { variantId: string; quantity: number; priceAtTime: number }[];
    deliveryFee?: number;
    discount?: number;
    paymentMethod: PaymentProvider;
  }) {
    const { items, deliveryFee = 0, discount = 0 } = input;

    const subtotal = items.reduce(
      (sum, i) => sum + i.priceAtTime * i.quantity,
      0
    );

    const totalAmount = subtotal + deliveryFee - discount;

    return prisma.order.create({
      data: {
        ...input,
        subtotal,
        totalAmount,
        paymentStatus: PaymentStatus.PENDING,
        status: OrderStatus.PENDING,
        items: {
          create: items.map((i) => ({
            variantId: i.variantId,
            quantity: i.quantity,
            priceAtTime: i.priceAtTime,
          })),
        },
      },
      include: { items: true },
    });
  },

  async updateStatus(orderId: string, status: OrderStatus) {
    return prisma.order.update({
      where: { id: orderId },
      data: { status },
    });
  },

  async markPaid(orderId: string) {
    return prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: PaymentStatus.SUCCESS },
    });
  },
};
