import { prisma } from "@/lib/db";
import type { ProductWithRelations } from "../shared/types";

export async function getProductBySlug(
  slug: string
): Promise<ProductWithRelations | null> {
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