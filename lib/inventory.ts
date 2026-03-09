// lib/inventory.ts
import { prisma } from "@/lib/db";
import { ApiError } from "@/lib/errors";
import { InventoryReason } from "@prisma/client";

/* ---------------------------------- */
/* Get current stock for a product    */
/* ---------------------------------- */
export async function getStock(productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { stock: true },
  });

  if (!product) throw ApiError.notFound("Product not found");
  return product.stock;
}

/* ---------------------------------- */
/* Ensure product has enough stock    */
/* ---------------------------------- */
export async function assertStockAvailable(productId: string, quantity: number) {
  const stock = await getStock(productId);

  if (stock < quantity) {
    throw ApiError.badRequest("Not enough stock available", {
      available: stock,
      requested: quantity,
    });
  }

  return true;
}

/* ---------------------------------- */
/* Decrease stock (sale, checkout)    */
/* ---------------------------------- */
export async function decreaseStock(
  productId: string,
  quantity: number,
  reason: InventoryReason = InventoryReason.SALE,
  reference?: string
) {
  await assertStockAvailable(productId, quantity);

  const updated = await prisma.product.update({
    where: { id: productId },
    data: { stock: { decrement: quantity } },
  });

  await prisma.inventoryMovement.create({
    data: {
      productId,
      change: -quantity,
      reason,
      reference,
    },
  });

  return updated;
}

/* ---------------------------------- */
/* Increase stock (refund, restock)   */
/* ---------------------------------- */
export async function increaseStock(
  productId: string,
  quantity: number,
  reason: InventoryReason = InventoryReason.RESTOCK,
  reference?: string
) {
  const updated = await prisma.product.update({
    where: { id: productId },
    data: { stock: { increment: quantity } },
  });

  await prisma.inventoryMovement.create({
    data: {
      productId,
      change: quantity,
      reason,
      reference,
    },
  });

  return updated;
}

/* ---------------------------------- */
/* Reserve stock (optional feature)   */
/* ---------------------------------- */
export async function reserveStock(
  productId: string,
  quantity: number,
  orderId: string
) {
  return decreaseStock(productId, quantity, InventoryReason.SALE, orderId);
}

/* ---------------------------------- */
/* Release stock (cancel order)       */
/* ---------------------------------- */
export async function releaseStock(
  productId: string,
  quantity: number,
  orderId: string
) {
  return increaseStock(productId, quantity, InventoryReason.REFUND, orderId);
}
