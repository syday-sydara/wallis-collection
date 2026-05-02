// services/order.service.ts
import { prisma } from "../lib/prisma";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import { OrderProducer } from "../producers/order.producer";
import { normalizePhone } from "../utils/phone";

export const OrderService = {
  async createOrder(input: {
    userId?: string;
    name?: string;
    email?: string;
    phoneNumber: string;
    items: { variantId: string; quantity: number }[];
    deliveryFee?: number;
    discount?: number;
    paymentMethod: string;
    addressId: string;
    notes?: string;
    externalRef?: string;
  }) {
    return prisma.$transaction(async (tx) => {
      // ------------------------------------------------------
      // 1. Validate items
      // ------------------------------------------------------
      if (!input.items.length) {
        throw new Error("Order must have items");
      }

      // ------------------------------------------------------
      // 2. Normalize + validate phone
      // ------------------------------------------------------
      const phone = normalizePhone(input.phoneNumber);
      if (!phone) throw new Error("Invalid phone number");

      // ------------------------------------------------------
      // 3. Find or create customer
      // ------------------------------------------------------
      const customer = await tx.customer.upsert({
        where: { phone },
        update: {
          name: input.name ?? undefined,
          email: input.email ?? undefined,
        },
        create: {
          phone,
          name: input.name ?? null,
          email: input.email ?? null,
        },
      });

      // ------------------------------------------------------
      // 4. Find most recent WhatsApp session for this customer
      // ------------------------------------------------------
      const session = await tx.whatsAppSession.findFirst({
        where: { customerId: customer.id },
        orderBy: { lastInboundAt: "desc" },
      });

      // ------------------------------------------------------
      // 5. Fetch variants
      // ------------------------------------------------------
      const variants = await tx.productVariant.findMany({
        where: {
          id: { in: input.items.map((i) => i.variantId) },
        },
      });

      if (variants.length !== input.items.length) {
        throw new Error("One or more variants are invalid");
      }

      const variantMap = new Map(variants.map((v) => [v.id, v]));

      // ------------------------------------------------------
      // 6. Build order items
      // ------------------------------------------------------
      const items = input.items.map((i) => {
        const variant = variantMap.get(i.variantId);
        if (!variant) throw new Error("Invalid variant");

        return {
          variantId: i.variantId,
          quantity: i.quantity,
          priceAtTime: variant.price,
        };
      });

      // ------------------------------------------------------
      // 7. Calculate totals
      // ------------------------------------------------------
      const subtotal = items.reduce(
        (sum, i) => sum + i.priceAtTime * i.quantity,
        0
      );

      const deliveryFee = input.deliveryFee ?? 0;
      const discount = input.discount ?? 0;

      const totalAmount = subtotal + deliveryFee - discount;

      // ------------------------------------------------------
      // 8. Create order
      // ------------------------------------------------------
      const order = await tx.order.create({
        data: {
          userId: input.userId ?? null,
          customerId: customer.id,
          phone,
          phoneNormalized: phone,
          addressId: input.addressId,
          notes: input.notes ?? null,
          externalRef: input.externalRef ?? null,

          subtotal,
          totalAmount,
          currency: "NGN",
          deliveryFee,
          discount,

          status: OrderStatus.PENDING,
          paymentStatus: PaymentStatus.PENDING,

          // Link to WhatsApp session if exists
          whatsAppSessionId: session?.id ?? null,

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

      // ------------------------------------------------------
      // 9. Emit checkout.started AFTER commit
      // ------------------------------------------------------
      setImmediate(() => {
        OrderProducer.checkoutStarted(order);
      });

      return order;
    });
  },
};
