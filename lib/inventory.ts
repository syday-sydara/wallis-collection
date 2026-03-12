// PATH: lib/inventory.ts
// NAME: inventory.ts

import { prisma } from "@/lib/db";
import { ApiError } from "@/lib/errors";
import { InventoryReason } from "@prisma/client";

/**
 * Decrease stock for a product and record an inventory movement.
 * Uses an interactive transaction to guarantee atomicity.
 */
export async function decreaseStock(
  productId: string,
  quantity: number,
  reason: InventoryReason = "SALE",
  reference?: string
) {
  await assertStockAvailable(productId, quantity);

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

/**
 * Ensure the product has enough stock before decreasing.
 * Throws ApiError if insufficient stock.
 */
export async function assertStockAvailable(productId: string, quantity: number) {
  const product = await prisma.product.findUnique({
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
}