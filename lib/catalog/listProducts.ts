// lib/catalog/listProducts.ts
import { prisma } from "@/lib/db";
import type { ProductWithRelations, ProductListParams, ProductListResult } from "./types";

/**
 * List products with optional filters and pagination
 */
export async function listProducts(
  params: ProductListParams = {}
): Promise<ProductListResult> {
  const { search, minPrice, maxPrice, includeArchived = false, limit = 24, cursor } = params;

  const products = await prisma.product.findMany({
    where: {
      deletedAt: null,
      isArchived: includeArchived ? undefined : false,
      AND: [
        search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
              ],
            }
          : {},
        minPrice !== undefined ? { basePrice: { gte: minPrice } } : {},
        maxPrice !== undefined ? { basePrice: { lte: maxPrice } } : {},
      ],
    },
    take: limit + 1,
    skip: cursor ? 1 : 0,
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: true,
    },
  });

  let nextCursor: string | null = null;
  if (products.length > limit) {
    const nextItem = products.pop();
    nextCursor = nextItem!.id;
  }

  return {
    items: products.slice(0, limit).map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      basePrice: p.basePrice,
      stock: p.variants.reduce((sum, v) => sum + v.price, 0),
      isArchived: p.isArchived,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      images: p.images.map((img) => ({
        id: img.id,
        url: img.url,
        alt: img.alt,
        sortOrder: img.sortOrder,
      })),
      variants: p.variants.map((v) => ({
        id: v.id,
        name: v.name,
        sku: v.sku,
        price: v.price,
      })),
    })),
    nextCursor,
  };
}