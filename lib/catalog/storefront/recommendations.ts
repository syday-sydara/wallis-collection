import { prisma } from "@/lib/db";
import type {
  ProductWithRelations,
  RecommendedProduct,
  ProductDetailResponse
} from "../shared/types";
import { getProductBySlug } from "./getProduct";

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