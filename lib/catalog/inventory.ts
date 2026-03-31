// lib/catalog/inventory.ts
export async function adjustProductStock(args: AdjustStockArgs) {
  const { productId, change, reason, reference } = args;

  if (change === 0) throw new Error("Stock change cannot be zero");

  return prisma.$transaction(async (tx) => {
    // Update product stock atomically
    const product = await tx.product.update({
      where: { id: productId },
      data: { stock: { increment: change } },
    });

    if (product.stock < 0) {
      throw new Error(`Insufficient stock for product ${productId}`);
    }

    // Log inventory movement
    await tx.inventoryMovement.create({
      data: { productId, change, reason, reference },
    });

    return product;
  });
}