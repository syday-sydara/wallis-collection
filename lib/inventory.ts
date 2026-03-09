// lib/inventory.ts
import { prisma } from "@/lib/db";
import { ApiError } from "@/lib/errors";
import { InventoryReason } from "@prisma/client";

export async function decreaseStock(
  productId: string,
  quantity: number,
  reason: InventoryReason = "SALE", // Note: Ensure this matches your Prisma enum
  reference?: string
) {
  await assertStockAvailable(productId, quantity);

  // Use interactive transactions to guarantee data integrity
  return prisma.$transaction(async (tx) => {
    const updated = await tx.product.update({
      where: { id: productId },
      data: { stock: { decrement: quantity } },
    });

    await tx.inventoryMovement.create({
      data: {
        productId,
        change: -quantity,
        reason,
        reference,
      },
    });

    return updated;
  });
}