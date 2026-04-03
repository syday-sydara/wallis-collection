// lib/catalog/service.ts
import { prisma } from "@/lib/db";
import type {
  ProductWithRelations,
  ProductListParams,
  ProductListResult,
  RecommendedProduct,
  ProductDetailResponse
} from "./shared/types";
import { listProducts } from "./storefront/listProducts";

export async function getProducts(params: ProductListParams = {}): Promise<ProductListResult> {
  return listProducts(params);
}

export async function getProductBySlug(slug: string): Promise<ProductWithRelations | null> {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: true
    }
  });

  if (!product || product.isArchived) return null;

  const stock = product.variants.reduce((sum, v) => sum + v.stock, 0);

  return {
    ...product,
    stock,
    images: product.images,
    variants: product.variants
  };
}

export async function listProductsForRecommendation(
  product: ProductWithRelations
): Promise<RecommendedProduct[]> {

  if (!product.basePrice) return [];

  const priceMin = Math.max(product.basePrice * 0.8, 0);
  const priceMax = product.basePrice * 1.2;

  const recommended = await prisma.product.findMany({
    where: {
      id: { not: product.id },
      isArchived: false,
      basePrice: { gte: priceMin, lte: priceMax }
    },
    take: 6,
    orderBy: { createdAt: "desc" },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: true
    }
  });

  return recommended.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    basePrice: p.basePrice,
    images: p.images
  }));
}

export async function getProductDetailWithRecommendations(
  slug: string
): Promise<ProductDetailResponse | null> {

  const product = await getProductBySlug(slug);
  if (!product) return null;

  const recommendations = await listProductsForRecommendation(product);

  return { product, recommendations };
}
