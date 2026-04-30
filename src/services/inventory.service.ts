import { prisma } from "../prisma/client";
import { ReservationStatus } from "@prisma/client";

export const InventoryService = {
  async reserveStock(variantId: string, quantity: number, ttlMs: number) {
    const expiresAt = new Date(Date.now() + ttlMs);

    return prisma.$transaction(async (tx) => {
      // 🔒 LOCK ROW (prevents race condition)
      const variant = await tx.$queryRaw<
        { stockQty: number }[]
      >`SELECT stockQty FROM "ProductVariant" WHERE id = ${variantId} FOR UPDATE`;

      if (!variant.length) throw new Error("Variant not found");

      const stockQty = variant[0].stockQty;

      const activeReserved = await tx.stockReservation.aggregate({
        where: {
          variantId,
          status: ReservationStatus.ACTIVE,
          expiresAt: { gt: new Date() },
        },
        _sum: { quantity: true },
      });

      const reservedQty = activeReserved._sum.quantity ?? 0;
      const available = stockQty - reservedQty;

      if (available < quantity) {
        throw new Error("Not enough stock available");
      }

      return tx.stockReservation.create({
        data: {
          variantId,
          quantity,
          expiresAt,
          status: ReservationStatus.ACTIVE,
        },
      });
    });
  },

  async releaseExpiredReservations() {
    return prisma.stockReservation.updateMany({
      where: {
        status: ReservationStatus.ACTIVE,
        expiresAt: { lt: new Date() },
      },
      data: {
        status: ReservationStatus.RELEASED,
      },
    });
  },

  async consumeReservation(reservationId: string, orderId: string) {
    return prisma.$transaction(async (tx) => {
      const reservation = await tx.stockReservation.findUnique({
        where: { id: reservationId },
      });

      if (!reservation || reservation.status !== "ACTIVE") {
        throw new Error("Invalid reservation");
      }

      return tx.stockReservation.update({
        where: { id: reservationId },
        data: {
          status: ReservationStatus.CONSUMED,
          orderId,
        },
      });
    });
  },
};