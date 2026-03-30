// lib/catalog/service.ts

import { prisma } from "@/lib/db";
import type { ProductListParams, ProductWithRelations } from "./types";

export async function listProducts(
  params: ProductListParams = {}
): Promise<ProductWithRelations[]> {
  const {
    search,
    minPrice,
    maxPrice,
    includeArchived = false,
    limit = 24,
    cursor
  } = params;

  return prisma.product.findMany({
    where: {
      isArchived: includeArchived ? undefined : false,
      deletedAt: null,
      AND: [
        search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } }
              ]
            }
          : {},
        minPrice !== undefined ? { basePrice: { gte: minPrice } } : {},
        maxPrice !== undefined ? { basePrice: { lte: maxPrice } } : {}
      ]
    },
    take: limit,
    skip: cursor ? 1 : 0,
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: true
    }
  });
}

export async function getProductBySlug(
  slug: string
): Promise<ProductWithRelations | null> {
  return prisma.product.findUnique({
    where: { slug, deletedAt: null },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: true
    }
  });
}

export async function getProductById(id: string) {
  return prisma.product.findUnique({
    where: { id, deletedAt: null },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: true
    }
  });
}
