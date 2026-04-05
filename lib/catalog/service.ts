// lib/catalog/service.ts
import { prisma } from "@/lib/db";
import type {
  ProductListParams,
  ProductListResult,
  RecommendedProduct,
} from "./shared/types";
import type { AdminProductDetail, AdminProductSummary } from "./admin";
import { toProductCardVM, toProductDetailVM } from "./shared/mappers";
import { toAdminProductSummary, toAdminProductDetail } from "./admin/admin-mappers";

/** --- Shared: fetch products with optional filters --- */
async function fetchProductsBase({
  search,
  minPrice,
  maxPrice,
  includeArchived = false,
  limit = 24,
  cursor,
  includeVariants = false,
  includeImages = true,
}: {
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  includeArchived?: boolean;
  limit?: number;
  cursor?: string;
  includeVariants?: boolean;
  includeImages?: boolean;
}) {
  return prisma.product.findMany({
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
    orderBy: [
      { createdAt: "desc" },
      { id: "desc" },
    ],
    include: {
      variants: includeVariants ? true : { select: { price: true } },
      images: includeImages ? { orderBy: { sortOrder: "asc" } } : false,
    },
  });
}

/** --- Public: list products --- */
export async function getProducts(params: ProductListParams = {}): Promise<ProductListResult> {
  const { limit = 24 } = params;
  const products = await fetchProductsBase({ ...params, limit });

  const hasMore = products.length > limit;
  const nextCursor = hasMore ? products[limit].id : null;

  return {
    items: products.slice(0, limit).map(toProductCardVM),
    nextCursor,
  };
}

/** --- Public: get product detail + recommendations --- */
export async function getProductDetailWithRecommendations(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: { select: { id: true, name: true, price: true, stock: true } },
    },
  });

  if (!product || product.isArchived || product.variants.length === 0) return null;

  const prices = product.variants.map((v) => v.price);
  const basePrice = Math.min(...prices);
  const priceMin = Math.max(basePrice * 0.8, 0);
  const priceMax = basePrice * 1.2;

  let recommended = await prisma.product.findMany({
    where: {
      id: { not: product.id },
      isArchived: false,
      variants: { some: { price: { gte: priceMin, lte: priceMax } } },
    },
    take: 6,
    orderBy: { createdAt: "desc" },
    include: { images: { take: 1, orderBy: { sortOrder: "asc" } }, variants: { select: { price: true } } },
  });

  if (recommended.length < 3) {
    const fallback = await prisma.product.findMany({
      where: { id: { not: product.id }, isArchived: false },
      take: 6,
      orderBy: { createdAt: "desc" },
      include: { images: { take: 1, orderBy: { sortOrder: "asc" } } },
    });
    recommended = [...recommended, ...fallback].slice(0, 6);
  }

  return toProductDetailVM(product, recommended);
}

/** --- Admin: list products paginated --- */
export async function adminListProductsPaginated(args: { cursor?: string; limit?: number }) {
  const safeLimit = Math.min(args.limit ?? 20, 50);
  const products = await fetchProductsBase({
    limit: safeLimit,
    cursor: args.cursor,
    includeVariants: true,
    includeImages: false,
  });

  const hasMore = products.length > safeLimit;
  const sliced = hasMore ? products.slice(0, safeLimit) : products;

  return {
    items: sliced.map(toAdminProductSummary),
    nextCursor: hasMore ? sliced[safeLimit - 1].id : null,
  };
}

/** --- Admin: get detailed product --- */
export async function adminGetProduct(id: string): Promise<AdminProductDetail | null> {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      variants: true,
      images: { orderBy: { sortOrder: "asc" } },
    },
  });
  if (!product) return null;
  return toAdminProductDetail(product);
}