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
    const product = await tx.product.update({
      where: { id: productId },
      data: {
        stock: { increment: change }
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
