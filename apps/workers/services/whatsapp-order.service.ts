// services/whatsapp-order.service.ts
import { prisma } from "@/lib/prisma";
import { WhatsAppOrderStatus } from "@prisma/client";
import { InventoryService } from "@/services/inventory.service";
import { OrderService } from "@/services/order.service";
import { Correlation } from "@/lib/correlation";
import { logger } from "@/lib/logger";

export const WhatsAppOrderService = {
  /**
   * Convert a WhatsAppOrder → Order.
   * Guarantees:
   * - idempotency
   * - strict state validation
   * - unified stock reservation
   * - unified order creation
   * - no duplicated logic across services
   */
  async convertToOrder(whatsappOrderId: string) {
    const ctx = Correlation.get();

    return prisma.$transaction(async (tx) => {
      // 1. Load WhatsApp order
      const wa = await tx.whatsAppOrder.findUnique({
        where: { id: whatsappOrderId },
        include: { items: true },
      });

      if (!wa) throw new Error("WhatsApp order not found");

      // 2. Idempotency
      if (wa.finalOrderId) {
        return tx.order.findUnique({ where: { id: wa.finalOrderId } });
      }

      // 3. Validate state + address
      validateWhatsAppOrder(wa);

      // 4. Reserve stock (deduplicated into a single helper)
      await reserveAllItems(wa);

      // 5. Create final order (deduplicated mapping)
      const order = await OrderService.createOrder(mapToOrderInput(wa));

      // 6. Mark WhatsApp order as converted
      await tx.whatsAppOrder.update({
        where: { id: whatsappOrderId },
        data: {
          finalOrderId: order.id,
          status: WhatsAppOrderStatus.CONVERTED,
        },
      });

      logger.info("[WA-ORDER] Converted WhatsApp order", {
        ...ctx,
        whatsappOrderId,
        orderId: order.id,
      });

      return order;
    });
  },
};

/**
 * Validate WhatsApp order state + address.
 */
function validateWhatsAppOrder(wa: any) {
  if (!wa.addressLine1 || !wa.state) {
    throw new Error("Missing address details");
  }

  if (wa.status !== WhatsAppOrderStatus.PENDING) {
    throw new Error("Invalid WhatsApp order state");
  }
}

/**
 * Reserve stock for all items (deduplicated).
 */
async function reserveAllItems(wa: any) {
  for (const item of wa.items) {
    await InventoryService.reserveStock(
      item.variantId,
      item.quantity,
      15 * 60 * 1000
    );
  }
}

/**
 * Map WhatsAppOrder → OrderService.createOrder input.
 * Removes duplication of field mapping.
 */
function mapToOrderInput(wa: any) {
  return {
    customerId: wa.userId ?? undefined,
    phone: wa.phoneNumber,
    addressLine1: wa.addressLine1,
    addressLine2: wa.addressLine2 ?? undefined,
    city: wa.city ?? undefined,
    state: wa.state,
    lga: wa.lga ?? undefined,
    landmark: wa.landmark ?? undefined,
    notes: wa.notes ?? undefined,
    items: wa.items.map((i: any) => ({
      variantId: i.variantId,
      quantity: i.quantity,
    })),
    paymentMethod: mapPaymentMethod(wa.paymentMethod),
  };
}
