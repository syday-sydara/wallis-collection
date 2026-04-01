// lib/catalog/listProducts.ts
import { prisma } from "@/lib/db";
import type { ProductListParams, ProductListResult } from "./types";

/**
 * List products with optional filters and pagination
 */
export async function listProducts(
  params: ProductListParams = {}
): Promise<ProductListResult> {
  const { search, minPrice, maxPrice, includeArchived = false, limit = 24, cursor } = params;

  const products = await prisma.product.findMany({
    where: {
      isArchived: includeArchived ? undefined : false,
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(minPrice !== undefined && { basePrice: { gte: minPrice } }),
      ...(maxPrice !== undefined && { basePrice: { lte: maxPrice } }),
    },
    take: limit + 1,
    skip: cursor ? 1 : 0,
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: true,
    },
  });

  const hasMore = products.length > limit;
  const nextCursor = hasMore ? products[limit].id : null;

  return {
    items: products.slice(0, limit).map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      basePrice: p.basePrice,
      stock: p.variants.reduce((sum, v) => sum + v.stock, 0),
      isArchived: p.isArchived,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      images: p.images,
      variants: p.variants,
    })),
    nextCursor,
  };
}
