// services/inventory.service.ts
import { prisma } from "../lib/prisma";
import { ReservationStatus } from "@prisma/client";
import { InventoryReserveProducer } from "../producers/inventory.reserve.producer";
import { OrderProducer } from "../producers/order.producer";

export class InventoryService {
  /**
   * Reserve inventory for an order.
   *
   * This is called by:
   * - inventory.reserve.worker
   * - order lifecycle flows
   *
   * Responsibilities:
   * - Fetch order + items
   * - Create stock reservations
   * - Emit STOCK_RESERVED events
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

    if (order.items.length === 0) {
      console.warn(`[INVENTORY] Order ${orderId} has no items`);
      return;
    }

    for (const item of order.items) {
      const { variantId, quantity } = item;

      const reservation = await prisma.stockReservation.create({
        data: {
          orderId,
          variantId,
          quantity,
          status: ReservationStatus.ACTIVE,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15‑minute hold
        },
      });

      // Emit event for downstream workers
      await OrderProducer.stockReserved(
        reservation.id,
        variantId,
        orderId
      );

      console.log("[INVENTORY] Reserved stock:", {
        reservationId: reservation.id,
        orderId,
        variantId,
        quantity,
      });
    }
  }

  /**
   * Consume a reservation and deduct stock.
   *
   * This is called when:
   * - Payment is confirmed
   * - Order is finalized
   *
   * Guarantees:
   * - Row‑level locking
   * - Idempotency
   * - Stock consistency
   */
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

      // Emit event for downstream systems
      await OrderProducer.stockConsumed(reservationId, orderId);

      return updated;
    });
  }
}
