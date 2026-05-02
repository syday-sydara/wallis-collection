import { prisma } from "../lib/prisma";
import { ReservationStatus } from "@prisma/client";

export class InventoryService {
  static async reserveForOrder(orderId: string) {
    // TODO: implement your reservation logic
    // Example placeholder:
    console.log(`Reserving inventory for order ${orderId}`);
  }

  static async consumeReservation(reservationId: string, orderId: string) {
    return prisma.$transaction(async tx => {
      const [reservation] = await tx.$queryRaw<
        {
          id: string;
          status: ReservationStatus;
          orderId: string | null;
          quantity: number;
          variantId: string;
          expiresAt: Date;
        }[]
      >`
        SELECT * FROM "StockReservation"
        WHERE id = ${reservationId}
        FOR UPDATE
      `;

      if (!reservation) throw new Error("Reservation not found");

      if (reservation.status === ReservationStatus.CONSUMED) {
        if (reservation.orderId !== orderId) {
          throw new Error("Reservation already consumed by another order");
        }
        return reservation;
      }

      if (
        reservation.status !== ReservationStatus.ACTIVE ||
        reservation.expiresAt <= new Date()
      ) {
        throw new Error("Reservation expired or invalid");
      }

      if (reservation.quantity <= 0) {
        throw new Error("Invalid reservation quantity");
      }

      const [variant] = await tx.$queryRaw<
        { id: string; stockQty: number }[]
      >`
        SELECT * FROM "ProductVariant"
        WHERE id = ${reservation.variantId}
        FOR UPDATE
      `;

      if (!variant) throw new Error("Variant not found");

      if (variant.stockQty < reservation.quantity) {
        throw new Error("Stock inconsistency detected");
      }

      await tx.productVariant.update({
        where: { id: reservation.variantId },
        data: {
          stockQty: { decrement: reservation.quantity },
        },
      });

      return tx.stockReservation.update({
        where: { id: reservationId },
        data: {
          status: ReservationStatus.CONSUMED,
          orderId,
        },
      });
    });
  }
}
