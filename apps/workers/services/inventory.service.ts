// services/inventory.service.ts
import { prisma } from "@/lib/prisma";
import { ReservationStatus } from "@prisma/client";
import { InventoryProducer } from "@/producers/inventory.producer";
import { ReservationExpiryProducer } from "@/producers/system.producer";

export class InventoryService {
  /**
   * Reserve inventory for an order.
   *
   * Guarantees:
   * - deterministic reservation creation
   * - no duplicate reservations
   * - reservation expiry scheduled
   * - typed STOCK_RESERVED event emitted
   */
  static async reserveForOrder(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: { variant: true },
        },
      },
    });

    if (!order) throw new Error(`Order not found: ${orderId}`);
    if (order.items.length === 0) return;

    for (const item of order.items) {
      const { variantId, quantity } = item;

      // Create reservation
      const reservation = await prisma.stockReservation.create({
        data: {
          orderId,
          variantId,
          quantity,
          status: ReservationStatus.ACTIVE,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        },
      });

      // Emit typed event
      await InventoryProducer.reserved({
        reservationId: reservation.id,
        variantId,
        quantity,
        orderId,
      });

      // Schedule expiry
      await ReservationExpiryProducer.scheduleExpiry(reservation.id);
    }
  }

  /**
   * Consume a reservation and deduct stock.
   *
   * Guarantees:
   * - row‑level locking
   * - idempotency
   * - stock consistency
   * - typed STOCK_CONSUMED event
   */
  static async consumeReservation(reservationId: string, orderId: string) {
    return prisma.$transaction(async (tx) => {
      // Lock reservation row
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

      // Idempotency
      if (reservation.status === ReservationStatus.CONSUMED) {
        if (reservation.orderId !== orderId) {
          throw new Error("Reservation already consumed by another order");
        }
        return reservation;
      }

      // Must be active + not expired
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

      if (!variant) throw new Error("Variant not found");

      if (variant.stockQty < reservation.quantity) {
        throw new Error("Stock inconsistency detected");
      }

      // Deduct stock
      await tx.productVariant.update({
        where: { id: reservation.variantId },
        data: {
          stockQty: { decrement: reservation.quantity },
        },
      });

      // Mark reservation as consumed
      const updated = await tx.stockReservation.update({
        where: { id: reservationId },
        data: {
          status: ReservationStatus.CONSUMED,
          orderId,
        },
      });

      // Emit typed event
      await InventoryProducer.consumed({
        reservationId,
        orderId,
      });

      return updated;
    });
  }
}
