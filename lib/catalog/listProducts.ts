// lib/catalog/listProducts.ts
import { prisma } from "@/lib/db";
import { ProductListParams, ProductListResult, ProductWithRelations } from "./types";

/**
 * Lists products with optional filters and cursor-based pagination.
 * Optimized for Nigerian e-commerce market (prices in kobo, NGN currency).
 */
export async function listProducts(params: ProductListParams): Promise<ProductListResult> {
  const {
    search,
    minPrice,
    maxPrice,
    includeArchived = false,
    limit = 24,
    cursor,
  } = params;

  const where: any = {
    deletedAt: null,
    ...(includeArchived ? {} : { isArchived: false }),
    ...(search
      ? { name: { contains: search, mode: "insensitive" } }
      : {}),
    ...(minPrice !== undefined || maxPrice !== undefined
      ? {
          basePrice: {
            ...(minPrice !== undefined ? { gte: minPrice } : {}),
            ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
          },
        }
      : {}),
  };

  const products = await prisma.product.findMany({
    take: limit + 1, // fetch one extra for nextCursor
    skip: cursor ? 1 : 0,
    cursor: cursor ? { id: cursor } : undefined,
    where,
    orderBy: { createdAt: "desc" },
    include: {
      images: { orderBy: { sortOrder: "asc" }, select: { id: true, url: true, alt: true, sortOrder: true } },
      variants: { select: { id: true, name: true, sku: true, price: true } },
    },
  });

  const hasMore = products.length > limit;
  const items: ProductWithRelations[] = hasMore ? products.slice(0, -1) : products;
  const nextCursor = hasMore ? items[items.length - 1].id : null;

  return { items, nextCursor };
}