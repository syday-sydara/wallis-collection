// lib/inventory.ts

import { prisma } from "@/lib/db";
import { ApiError } from "@/lib/errors";
import { InventoryReason } from "@prisma/client";

/**
 * Atomically decrease stock and record an inventory movement.
 */
export async function decreaseStock(
  productId: string,
  quantity: number,
  reason: InventoryReason = "SALE",
  reference?: string
) {
  return prisma.$transaction(async (tx) => {
    // Lock row and fetch stock
    const product = await tx.product.findUnique({
      where: { id: productId },
      select: { stock: true, name: true },
    });

    if (!product) {
      throw ApiError.notFound("Product not found");
    }

    if (product.stock < quantity) {
      throw ApiError.badRequest(
        `Insufficient stock for ${product.name}. Available: ${product.stock}, requested: ${quantity}`
      );
    }

    // Decrement stock
    const updated = await tx.product.update({
      where: { id: productId },
      data: { stock: { decrement: quantity } },
    });

    // Record movement
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
