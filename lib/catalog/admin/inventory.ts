import { prisma } from "@/lib/db";

type AdjustStockArgs = {
  variantId: string;
  change: number; // positive or negative
  reason?: string;
};

export async function adjustProductStock({
  variantId,
  change,
  reason
}: AdjustStockArgs) {
  if (!variantId) throw new Error("Variant ID is required");
  if (change === 0) throw new Error("Stock change cannot be zero");

  return prisma.$transaction(async (tx) => {
    const variant = await tx.productVariant.findUnique({
      where: { id: variantId },
      select: { stock: true }
    });

    if (!variant) throw new Error("Variant not found");

    if (change < 0 && variant.stock < Math.abs(change)) {
      throw new Error("Insufficient stock");
    }

    const updated = await tx.productVariant.update({
      where: { id: variantId },
      data: { stock: { increment: change } },
      select: {
        id: true,
        stock: true,
        price: true,
        name: true,
        sku: true,
        productId: true
      }
    });

    await tx.stockLog.create({
      data: {
        variantId,
        change,
        reason:
          reason ?? (change > 0 ? "manual increase" : "manual decrease")
      }
    });

    return updated;
  });
}