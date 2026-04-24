// lib/inventory/release.ts
import { prisma } from "@/lib/prisma";

/**
 * Release reserved inventory for an order.
 * Returns stock back to available inventory.
 * Safe to call multiple times (idempotent).
 */
export async function releaseInventory(orderId: string) {
  return prisma.$transaction(async (tx) => {
    const reservations = await tx.inventoryReservation.findMany({
      where: { orderId },
    });

    if (reservations.length === 0) {
      return;
    }

    // Return reserved stock
    for (const r of reservations) {
      await tx.product.update({
        where: { id: r.productId },
        data: {
          stock: { increment: r.quantity },
        },
      });
    }

    // Remove reservation records
    await tx.inventoryReservation.deleteMany({
      where: { orderId },
    });
  });
}
