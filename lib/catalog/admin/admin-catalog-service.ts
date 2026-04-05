// lib/products/admin-catalog-service.ts
import { prisma } from "@/lib/db";
import type { AdminProductSummary, AdminProductDetail } from "./types";

/** -------------------- PRODUCTS -------------------- */

/**
 * List products for admin (paginated)
 */
export async function adminListProductsPaginated(args: {
  cursor?: string;
  limit?: number;
}): Promise<{ items: AdminProductSummary[]; nextCursor: string | null }> {
  const safeLimit = Math.min(args.limit ?? 20, 50);

  const items = await prisma.product.findMany({
    take: safeLimit + 1,
    skip: args.cursor ? 1 : 0,
    cursor: args.cursor ? { id: args.cursor } : undefined,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      basePrice: true,
      isArchived: true,
      updatedAt: true,
      variants: { select: { stock: true } },
    },
  });

  const hasMore = items.length > safeLimit;
  const sliced = hasMore ? items.slice(0, -1) : items;

  const data: AdminProductSummary[] = sliced.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    basePrice: p.basePrice,
    stock: p.variants.reduce((sum, v) => sum + v.stock, 0),
    isArchived: p.isArchived,
    updatedAt: p.updatedAt,
  }));

  const nextCursor = hasMore ? sliced[sliced.length - 1].id : null;
  return { items: data, nextCursor };
}

/**
 * Get detailed product for admin
 */
export async function adminGetProduct(productId: string): Promise<AdminProductDetail | null> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      basePrice: true,
      isArchived: true,
      updatedAt: true,
      images: { orderBy: { sortOrder: "asc" }, select: { id: true, url: true, alt: true, sortOrder: true } },
      variants: { select: { id: true, name: true, sku: true, price: true, stock: true } },
    },
  });

  if (!product) return null;

  const stock = product.variants.reduce((sum, v) => sum + v.stock, 0);
  return { ...product, stock };
}

/**
 * Create a new product
 */
export async function adminCreateProduct(data: {
  name: string;
  slug: string;
  basePrice: number | null;
  description: string | null;
}) {
  return prisma.product.create({
    data: {
      name: data.name,
      slug: data.slug,
      basePrice: data.basePrice,
      description: data.description,
    },
    select: { id: true },
  });
}

/**
 * Update product
 */
export async function adminUpdateProduct(
  productId: string,
  data: { name: string; slug: string; description: string | null; basePrice: number | null }
) {
  return prisma.product.update({
    where: { id: productId },
    data,
  });
}

/** -------------------- VARIANTS -------------------- */

/**
 * Create a new variant
 */
export async function adminCreateVariant(
  productId: string,
  data: { name: string; sku: string; price: number; stock: number }
) {
  return prisma.productVariant.create({
    data: { ...data, productId },
  });
}

/**
 * Update variant
 */
export async function adminUpdateVariant(
  variantId: string,
  data: { name: string; sku: string; price: number }
) {
  return prisma.productVariant.update({
    where: { id: variantId },
    data,
  });
}

/**
 * Delete variant
 */
export async function adminDeleteVariant(variantId: string) {
  return prisma.productVariant.delete({
    where: { id: variantId },
  });
}

/** -------------------- IMAGES -------------------- */

/**
 * Add a new image
 */
export async function adminAddImage(productId: string, file: File, alt: string | null) {
  // TODO: replace with actual storage upload
  const url = `/uploads/${file.name}`;

  const maxOrder = await prisma.productImage.aggregate({
    where: { productId },
    _max: { sortOrder: true },
  });

  return prisma.productImage.create({
    data: {
      productId,
      url,
      alt,
      sortOrder: (maxOrder._max.sortOrder ?? 0) + 1,
    },
  });
}

/**
 * Delete image
 */
export async function adminDeleteImage(imageId: string) {
  return prisma.productImage.delete({ where: { id: imageId } });
}

/**
 * Reorder images
 */
export async function adminReorderImages(productId: string, newOrder: string[]) {
  await prisma.$transaction(
    newOrder.map((id, index) =>
      prisma.productImage.update({
        where: { id },
        data: { sortOrder: index },
      })
    )
  );
}

/** -------------------- STOCK -------------------- */

type AdjustStockArgs = {
  variantId: string;
  change: number; // positive or negative
  reason?: string;
};

/**
 * Adjust stock for a variant and log it
 */
export async function adjustProductStock({ variantId, change, reason }: AdjustStockArgs) {
  if (!variantId) throw new Error("Variant ID is required");
  if (change === 0) throw new Error("Stock change cannot be zero");

  return prisma.$transaction(async (tx) => {
    const variant = await tx.productVariant.findUnique({ where: { id: variantId }, select: { stock: true } });
    if (!variant) throw new Error("Variant not found");
    if (change < 0 && variant.stock < Math.abs(change)) throw new Error("Insufficient stock");

    const updated = await tx.productVariant.update({
      where: { id: variantId },
      data: { stock: { increment: change } },
      select: { id: true, stock: true, price: true, name: true, sku: true, productId: true },
    });

    await tx.stockLog.create({
      data: { variantId, change, reason: reason ?? (change > 0 ? "manual increase" : "manual decrease") },
    });

    return updated;
  });
}