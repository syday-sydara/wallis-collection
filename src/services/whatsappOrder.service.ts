import { prisma } from "../prisma/client";
import {
  WhatsAppOrderStatus,
  PaymentProvider,
  WhatsAppPaymentMethod,
} from "@prisma/client";
import { OrderService } from "./order.service";
import { InventoryService } from "./inventory.service";

export const WhatsAppOrderService = {
  async create(input: any) {
    return prisma.whatsAppOrder.create({
      data: {
        ...input,
        status: WhatsAppOrderStatus.PENDING,
        items: {
          create: input.items.map((i: any) => ({
            variantId: i.variantId,
            quantity: i.quantity,
            priceAtTime: i.priceAtTime,
          })),
        },
      },
      include: { items: true },
    });
  },

  async convertToOrder(whatsappOrderId: string) {
    return prisma.$transaction(async (tx) => {
      const wa = await tx.whatsAppOrder.findUnique({
        where: { id: whatsappOrderId },
        include: { items: true },
      });

      if (!wa) throw new Error("WhatsApp order not found");

      if (!wa.addressLine1 || !wa.state) {
        throw new Error("Missing address details");
      }

      // 🔥 1. Reserve stock FIRST
      for (const item of wa.items) {
        await InventoryService.reserveStock(
          item.variantId,
          item.quantity,
          15 * 60 * 1000
        );
      }

      // 🔥 2. Create main order
      const order = await OrderService.createOrder({
        userId: wa.userId ?? undefined,
        phoneNumber: wa.phoneNumber,
        addressLine1: wa.addressLine1,
        addressLine2: wa.addressLine2 ?? undefined,
        city: wa.city ?? undefined,
        state: wa.state,
        lga: wa.lga ?? undefined,
        landmark: wa.landmark ?? undefined,
        deliveryNote: wa.notes ?? undefined,
        items: wa.items.map((i) => ({
          variantId: i.variantId,
          quantity: i.quantity,
          priceAtTime: i.priceAtTime,
        })),
        paymentMethod: mapPaymentMethod(wa.paymentMethod),
      });

      // 🔥 3. Update WhatsApp status safely
      await tx.whatsAppOrder.update({
        where: { id: whatsappOrderId },
        data: {
          finalOrderId: order.id,
          status: WhatsAppOrderStatus.CONVERTED,
        },
      });

      return order;
    });
  },
};

// helper
function mapPaymentMethod(method?: WhatsAppPaymentMethod) {
  switch (method) {
    case "CASH_ON_DELIVERY":
      return PaymentProvider.CASH_ON_DELIVERY;
    default:
      return PaymentProvider.BANK_TRANSFER;
  }
}