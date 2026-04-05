import { prisma } from "@/lib/db";
import type { ProductListParams, ProductListResult, ProductClientVM } from "./types";
import { toProductCardVM } from "./mappers";

/** --- List products --- */
export async function getProducts(params: ProductListParams = {}): Promise<ProductListResult> {
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
      ...(minPrice !== undefined || maxPrice !== undefined
        ? {
            variants: {
              some: {
                ...(minPrice !== undefined && { price: { gte: minPrice } }),
                ...(maxPrice !== undefined && { price: { lte: maxPrice } }),
              },
            },
          }
        : {}),
    },
    take: limit + 1,
    skip: cursor ? 1 : 0,
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: { select: { price: true } },
    },
  });

  const hasMore = products.length > limit;
  const nextCursor = hasMore ? products[limit].id : null;

  return {
    items: products.slice(0, limit),
    nextCursor,
  };
}

/** --- Get product detail + recommendations --- */
export async function getProductDetailWithRecommendations(slug: string): Promise<ProductClientVM | null> {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: { select: { id: true, name: true, price: true, stock: true, sku: true } },
    },
  });

  if (!product || product.isArchived) return null;

  const prices = product.variants.map((v) => v.price);
  const basePrice = Math.min(...prices);

  const priceMin = Math.max(basePrice * 0.8, 0);
  const priceMax = basePrice * 1.2;

  const recommended = await prisma.product.findMany({
    where: {
      id: { not: product.id },
      isArchived: false,
      variants: { some: { price: { gte: priceMin, lte: priceMax } } },
    },
    take: 6,
    orderBy: { createdAt: "desc" },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: { select: { price: true } },
    },
  });

  return { ...product, recommended };
}