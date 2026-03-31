// lib/catalog/service.ts

import { prisma } from "@/lib/db";
import type { ProductListParams, ProductWithRelations } from "./types";

/**
 * List products with stock computed from inventory movements
 */
export async function listProducts(
  params: ProductListParams = {}
): Promise<ProductWithRelations[]> {
  const {
    search,
    minPrice,
    maxPrice,
    includeArchived = false,
    limit = 24,
    cursor,
  } = params;

  // Fetch products with images, variants, and stock aggregation
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
        minPrice !== undefined ? { variants: { some: { price: { gte: minPrice } } } } : {},
        maxPrice !== undefined ? { variants: { some: { price: { lte: maxPrice } } } } : {},
      ],
    },
    take: limit + 1, // for cursor-based pagination
    skip: cursor ? 1 : 0,
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: { select: { id: true, price: true, name: true, sku: true } },
      inventory: { select: { change: true } },
    },
  });

  // Map stock and min/max prices
  const mapped = products.map((p) => {
    const stock = p.inventory.reduce((sum, m) => sum + m.change, 0);
    const prices = p.variants.map((v) => v.price);
    const minPriceVariant = prices.length ? Math.min(...prices) : 0;
    const maxPriceVariant = prices.length ? Math.max(...prices) : 0;

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      basePrice: minPriceVariant,
      stock,
      isArchived: p.isArchived,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      images: p.images.map((img) => ({
        id: img.id,
        url: img.url,
        alt: img.alt,
        sortOrder: img.sortOrder,
      })),
      variants: p.variants,
    };
  });

  // Determine next cursor
  let nextCursor: string | null = null;
  if (mapped.length > limit) {
    const nextItem = mapped.pop();
    nextCursor = nextItem!.id;
  }

  return mapped.slice(0, limit);
}

/**
 * Get single product by ID with stock computed
 */
export async function getProductById(id: string): Promise<ProductWithRelations | null> {
  const product = await prisma.product.findUnique({
    where: { id, deletedAt: null },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: true,
      inventory: { select: { change: true } },
    },
  });

  if (!product) return null;

  const stock = product.inventory.reduce((sum, m) => sum + m.change, 0);
  const prices = product.variants.map((v) => v.price);
  const minPriceVariant = prices.length ? Math.min(...prices) : 0;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    basePrice: minPriceVariant,
    stock,
    isArchived: product.isArchived,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    images: product.images.map((img) => ({
      id: img.id,
      url: img.url,
      alt: img.alt,
      sortOrder: img.sortOrder,
    })),
    variants: product.variants,
  };
}