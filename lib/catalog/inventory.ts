// lib/catalog/inventory.ts

import { prisma } from "@/lib/db";

export async function adjustProductStock(args: {
  productId: string;
  change: number;
  reason: string;
  reference?: string;
}) {
  const { productId, change, reason, reference } = args;

  return prisma.$transaction(async (tx) => {
    const current = await tx.product.findUnique({
      where: { id: productId },
      select: { stock: true }
    });
    if (!current) throw new Error("Product not found");

    const newStock = current.stock + change;
    if (newStock < 0) {
      throw new Error("Stock cannot be negative");
    }

    const product = await tx.product.update({
      where: { id: productId },
      data: {
        stock: newStock
      }
    });

    await tx.inventoryMovement.create({
      data: {
        productId,
        change,
        reason,
        reference
      }
    });

    return product;
  });
}
