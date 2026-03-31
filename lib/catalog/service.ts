// lib/catalog/service.ts
import { prisma } from "@/lib/db";
import type { 
  ProductWithRelations, 
  ProductListParams, 
  ProductListResult,
  RecommendedProduct,
  ProductDetailResponse
} from "./types";
import { listProducts } from "./listProducts";

/**
 * List products with optional filters and pagination
 */
export async function getProducts(params: ProductListParams = {}): Promise<ProductListResult> {
  return listProducts(params);
}

/**
 * Get product by slug including variants and images
 */
export async function getProductBySlug(slug: string): Promise<ProductWithRelations | null> {
  const product = await prisma.product.findFirst({
    where: { slug, deletedAt: null, isArchived: false },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: true
    }
  });

  if (!product) return null;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    basePrice: product.basePrice,
    stock: product.variants.reduce((sum, v) => sum + v.price, 0),
    isArchived: product.isArchived,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    images: product.images.map(img => ({
      id: img.id,
      url: img.url,
      alt: img.alt,
      sortOrder: img.sortOrder
    })),
    variants: product.variants.map(v => ({
      id: v.id,
      name: v.name,
      sku: v.sku,
      price: v.price
    }))
  };
}

/**
 * List recommended products for a given product
 * Strategy: similar basePrice ±20% and exclude current product
 */
export async function listProductsForRecommendation(product: ProductWithRelations): Promise<RecommendedProduct[]> {
  const priceMin = Math.max(product.basePrice * 0.8, 0);
  const priceMax = product.basePrice * 1.2;

  const recommended = await prisma.product.findMany({
    where: {
      id: { not: product.id },
      deletedAt: null,
      isArchived: false,
      basePrice: { gte: priceMin, lte: priceMax },
    },
    take: 6,
    orderBy: [{ createdAt: "desc" }],
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: true,
    },
  });

  return recommended.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    basePrice: p.basePrice,
    images: p.images.map(img => ({
      id: img.id,
      url: img.url,
      alt: img.alt,
      sortOrder: img.sortOrder,
    })),
  }));
}

/**
 * Fetch product details with recommendations
 */
export async function getProductDetailWithRecommendations(slug: string): Promise<ProductDetailResponse | null> {
  const product = await getProductBySlug(slug);
  if (!product) return null;

  const recommendations = await listProductsForRecommendation(product);

  return { product, recommendations };
}