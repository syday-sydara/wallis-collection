// lib/catalog/service.ts
import { prisma } from "@/lib/db";
import type {
  ProductWithRelations,
  RecommendedProduct,
  ProductDetailResponse,
  ProductListParams,
  ProductListResult
} from "./shared/types";
import { toProductCardVM, toProductDetailVM } from "./shared/mappers";

/** --- List products with filters --- */
export async function getProducts(params: ProductListParams = {}): Promise<ProductListResult> {
  const { search, minPrice, maxPrice, includeArchived = false, limit = 24, cursor } = params;

  const products = await prisma.product.findMany({
    where: {
      isArchived: includeArchived ? undefined : false,
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } }
        ]
      }),
      ...(minPrice !== undefined && { basePrice: { gte: minPrice } }),
      ...(maxPrice !== undefined && { basePrice: { lte: maxPrice } })
    },
    take: limit + 1,
    skip: cursor ? 1 : 0,
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: { createdAt: "desc" },
    include: { images: { orderBy: { sortOrder: "asc" } }, variants: true }
  });

  const hasMore = products.length > limit;
  const nextCursor = hasMore ? products[limit].id : null;

  return {
    items: products.slice(0, limit).map((p) => toProductCardVM(p)),
    nextCursor
  };
}

/** --- Get product by slug --- */
export async function getProductDetailWithRecommendations(slug: string): Promise<ProductClientVM | null> {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { images: { orderBy: { sortOrder: "asc" } }, variants: true }
  });

  if (!product || product.isArchived) return null;

  const priceMin = Math.max(product.basePrice! * 0.8, 0);
  const priceMax = product.basePrice! * 1.2;

  const recommended: RecommendedProduct[] = await prisma.product.findMany({
    where: { id: { not: product.id }, isArchived: false, basePrice: { gte: priceMin, lte: priceMax } },
    take: 6,
    orderBy: { createdAt: "desc" },
    include: { images: { orderBy: { sortOrder: "asc" } }, variants: true }
  }).then(res => res.map(r => ({ id: r.id, name: r.name, slug: r.slug, basePrice: r.basePrice, images: r.images })));

  return toProductDetailVM(product, recommended);
}