// services/whatsapp-order.service.ts
import { prisma } from "../lib/prisma/prisma";
import { WhatsAppOrderStatus } from "@prisma/client";
import { InventoryService } from "./inventory.service";
import { OrderService } from "./order.service";

export const WhatsAppOrderService = {
  async convertToOrder(whatsappOrderId: string) {
    return prisma.$transaction(async (tx) => {
      const wa = await tx.whatsAppOrder.findUnique({
        where: { id: whatsappOrderId },
        include: { items: true },
      });

      if (!wa) {
        throw new Error("WhatsApp order not found");
      }

      // Idempotency: already converted
      if (wa.finalOrderId) {
        return tx.order.findUnique({
          where: { id: wa.finalOrderId },
        });
      }

      // Validate address
      if (!wa.addressLine1 || !wa.state) {
        throw new Error("Missing address details");
      }

      // Validate state
      if (wa.status !== WhatsAppOrderStatus.PENDING) {
        throw new Error("Invalid WhatsApp order state");
      }

      // Reserve stock for each item
      // NOTE: This should ideally be a batch reservation
      for (const item of wa.items) {
        await InventoryService.reserveStock(
          item.variantId,
          item.quantity,
          15 * 60 * 1000 // 15 minutes
        );
      }

      // Create order
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
        })),
        paymentMethod: mapPaymentMethod(wa.paymentMethod),
      });

      // Mark WhatsApp order as converted
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
