// lib/inventory/confirm.ts
import { prisma } from "@/lib/prisma";

/**
 * Confirm inventory for an order.
 * Moves reserved stock → actual stock reduction.
 * Safe to call multiple times (idempotent).
 */
export async function confirmInventory(orderId: string) {
  return prisma.$transaction(async (tx) => {
    // Fetch reserved items
    const reservations = await tx.inventoryReservation.findMany({
      where: { orderId },
    });

    if (reservations.length === 0) {
      // Nothing to confirm (already confirmed or no reservation)
      return;
    }

    // Reduce actual stock
    for (const r of reservations) {
      await tx.product.update({
        where: { id: r.productId },
        data: {
          stock: { decrement: r.quantity },
        },
      });
    }

    // Remove reservation records
    await tx.inventoryReservation.deleteMany({
      where: { orderId },
    });
  });
}
