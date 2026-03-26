// PATH: lib/orders/inventory.ts

import { prisma } from "@/lib/db";
import { ApiError } from "@/lib/api/response";
import { InventoryReason } from "@prisma/client";

/**
 * Decrease stock for a specific variant (atomic + logged)
 */
export async function decreaseVariantStock(
  variantId: string,
  quantity: number,
  reason: InventoryReason = "SALE",
  reference?: string
) {
  return prisma.$transaction(async (tx) => {
    const variant = await tx.productVariant.findUnique({
      where: { id: variantId },
      select: {
        id: true,
        stock: true,
        size: true,
        color: true,
        product: { select: { id: true, name: true } },
      },
    });

    if (!variant) {
      throw ApiError.notFound("Variant not found");
    }

    if (variant.stock < quantity) {
      throw ApiError.badRequest(
        `Insufficient stock for ${variant.product.name} (${variant.size ?? variant.color}). Available: ${variant.stock}, requested: ${quantity}`
      );
    }

    const updated = await tx.productVariant.update({
      where: { id: variantId },
      data: { stock: { decrement: quantity } },
    });

    await tx.inventoryMovement.create({
      data: {
        productId: variant.product.id,
        variantId: variant.id,
        change: -quantity,
        reason,
        metadata: { reference },
      },
    });

    return updated;
  });
}

/**
 * Increase stock (refund, restock, manual adjustment)
 */
export async function increaseVariantStock(
  variantId: string,
  quantity: number,
  reason: InventoryReason = "RESTOCK",
  reference?: string
) {
  return prisma.$transaction(async (tx) => {
    const variant = await tx.productVariant.findUnique({
      where: { id: variantId },
      select: {
        id: true,
        product: { select: { id: true, name: true } },
      },
    });

    if (!variant) {
      throw ApiError.notFound("Variant not found");
    }

    const updated = await tx.productVariant.update({
      where: { id: variantId },
      data: { stock: { increment: quantity } },
    });

    await tx.inventoryMovement.create({
      data: {
        productId: variant.product.id,
        variantId: variant.id,
        change: quantity,
        reason,
        metadata: { reference },
      },
    });

    return updated;
  });
}
