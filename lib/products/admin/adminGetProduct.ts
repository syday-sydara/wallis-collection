import { prisma } from "@/lib/prisma";
import type { AdminProductDetail } from "../types";

export async function adminGetProduct(id: string): Promise<AdminProductDetail | null> {
  const product = await prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      basePrice: true,
      isArchived: true,
      updatedAt: true,
      images: {
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          url: true,
          alt: true,
          sortOrder: true,
        },
      },
      variants: {
        select: {
          id: true,
          name: true,
          sku: true,
          price: true,
          stock: true,
        },
      },
    },
  });

  if (!product) return null;

  const stock = product.variants.reduce((sum, v) => sum + v.stock, 0);

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    basePrice: product.basePrice,
    isArchived: product.isArchived,
    updatedAt: product.updatedAt,
    stock,
    images: product.images,
    variants: product.variants,
  };
}
