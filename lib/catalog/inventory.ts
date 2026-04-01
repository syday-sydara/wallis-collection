// lib/catalog/inventory.ts

import { prisma } from "@/lib/db";

type AdjustStockArgs = {
  variantId: string;
  change: number;
  reason: string;
  reference?: string;
};

export async function adjustProductStock(args: AdjustStockArgs) {
  const { variantId, change, reason, reference } = args;

  if (change === 0) {
    throw new Error("Stock change cannot be zero");
  }

  return prisma.$transaction(async (tx) => {
    const result = await tx.productVariant.updateMany({
      where: {
        id: variantId,
        stock: {
          gte: change < 0 ? Math.abs(change) : 0
        }
      },
      data: {
        stock: {
          increment: change
        }
      }
    });

    if (result.count === 0) {
      throw new Error("Insufficient stock");
    }

    const variant = await tx.productVariant.findUnique({
      where: { id: variantId },
      select: {
        id: true,
        stock: true,
        productId: true
      }
    });

    await tx.inventoryMovement.create({
      data: {
        productId: variant!.productId,
        change,
        reason,
        reference
      }
    });

    return variant;
  });
}