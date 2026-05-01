export const WhatsAppOrderService = {
  async convertToOrder(whatsappOrderId: string) {
    return prisma.$transaction(async (tx) => {
      const wa = await tx.whatsAppOrder.findUnique({
        where: { id: whatsappOrderId },
        include: { items: true },
      });

      if (!wa) throw new Error("WhatsApp order not found");

      if (wa.finalOrderId) {
        return tx.order.findUnique({
          where: { id: wa.finalOrderId },
        });
      }

      if (!wa.addressLine1 || !wa.state) {
        throw new Error("Missing address details");
      }

      if (wa.status !== WhatsAppOrderStatus.PENDING) {
        throw new Error("Invalid WhatsApp order state");
      }

      // reserve stock (should ideally be batch operation)
      for (const item of wa.items) {
        await InventoryService.reserveStock(
          item.variantId,
          item.quantity,
          15 * 60 * 1000
        );
      }

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