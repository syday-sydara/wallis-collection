import { prisma } from "@/lib/db";
import type { ProductListParams, ProductListResult, ProductWithRelations } from "./types";

/**
 * Lists products with optional filters and cursor pagination
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

  // Build Prisma where filter
  const where: any = {
    AND: [
      !includeArchived && { isArchived: false },
      search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { slug: { contains: search, mode: "insensitive" } },
        ],
      },
      minPrice !== undefined && { basePrice: { gte: minPrice } },
      maxPrice !== undefined && { basePrice: { lte: maxPrice } },
    ].filter(Boolean),
  };

  // Prisma findMany with cursor-based pagination
  const items = await prisma.product.findMany({
    where,
    take: limit + 1, // fetch one extra to determine next cursor
    cursor: cursor ? { id: cursor } : undefined,
    skip: cursor ? 1 : 0, // skip the cursor itself if provided
    orderBy: { createdAt: "desc" }, // consistent ordering
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      basePrice: true,
      stock: true,
      isArchived: true,
      createdAt: true,
      updatedAt: true,
      images: {
        select: { id: true, url: true, alt: true, sortOrder: true },
        orderBy: { sortOrder: "asc" },
      },
      variants: { select: { id: true, name: true, sku: true, price: true } },
    },
  });

  let nextCursor: string | null = null;
  if (items.length > limit) {
    const nextItem = items.pop(); // remove extra item
    nextCursor = nextItem!.id;
  }

  return {
    items,
    nextCursor,
  };
}