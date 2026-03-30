// lib/catalog/inventory.ts

import { prisma } from "@/lib/db";

export type AdjustStockArgs = {
  productId: string;
  change: number;
  reason: string;
  reference?: string;
};

/**
 * Adjusts the stock of a product atomically and logs the change in inventory movements.
 *
 * @param args - Product ID, stock change, reason, optional reference
 * @throws Error if product not found or resulting stock would be negative
 */
export async function adjustProductStock(args: AdjustStockArgs) {
  const { productId, change, reason, reference } = args;

  if (change === 0) {
    throw new Error("Stock change cannot be zero");
  }

  return prisma.$transaction(async (tx) => {
    // Fetch current stock
    const current = await tx.product.findUnique({
      where: { id: productId },
      select: { stock: true },
    });

    if (!current) {
      throw new Error(`Product with id=${productId} not found`);
    }

    const newStock = current.stock + change;
    if (newStock < 0) {
      throw new Error(
        `Insufficient stock for product ${productId}: current=${current.stock}, change=${change}`
      );
    }

    // Update product stock
    const product = await tx.product.update({
      where: { id: productId },
      data: { stock: newStock },
    });

    // Log inventory movement
    await tx.inventoryMovement.create({
      data: {
        productId,
        change,
        reason,
        reference,
      },
    });

    return product;
  });
}