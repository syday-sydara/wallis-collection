import { prisma } from "../prisma/client";
import { ReservationStatus } from "@prisma/client";

export async function consumeReservation(reservationId: string, orderId: string) {
  return prisma.$transaction(async (tx) => {
    // Lock reservation row
    const [reservation] = await tx.$queryRaw<
      { id: string; status: string; orderId: string | null; quantity: number; variantId: string; expiresAt: Date }[]
    >`
      SELECT * FROM "StockReservation"
      WHERE id = ${reservationId}
      FOR UPDATE
    `;

    if (!reservation) {
      throw new Error("Reservation not found");
    }

    // Idempotency + ownership check
    if (reservation.status === ReservationStatus.CONSUMED) {
      if (reservation.orderId !== orderId) {
        throw new Error("Reservation already consumed by another order");
      }
      return reservation;
    }

    // Must be ACTIVE and not expired
    if (
      reservation.status !== ReservationStatus.ACTIVE ||
      reservation.expiresAt <= new Date()
    ) {
      throw new Error("Reservation expired or invalid");
    }

    if (reservation.quantity <= 0) {
      throw new Error("Invalid reservation quantity");
    }

    // Lock variant row
    const [variant] = await tx.$queryRaw<
      { id: string; stockQty: number }[]
    >`
      SELECT * FROM "ProductVariant"
      WHERE id = ${reservation.variantId}
      FOR UPDATE
    `;

    if (!variant) {
      throw new Error("Variant not found");
    }

    // Ensure stock is still available
    if (variant.stockQty < reservation.quantity) {
      throw new Error("Stock inconsistency detected");
    }

    // Deduct stock
    await tx.productVariant.update({
      where: { id: reservation.variantId },
      data: {
        stockQty: {
          decrement: reservation.quantity,
        },
      },
    });

    // Mark reservation as consumed
    return tx.stockReservation.update({
      where: { id: reservationId },
      data: {
        status: ReservationStatus.CONSUMED,
        orderId,
      },
    });
  });
}
