// lib/products/adminGetProductDetail.ts
import { prisma } from "@/lib/db";
import type { AdminProductDetail } from "./types";

export async function adminGetProductDetail(productId: string): Promise<AdminProductDetail | null> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      variants: true, // Include variants related to this product
      images: true,   // Include images related to this product
    },
  });

  if (!product) return null;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    basePrice: product.basePrice,
    stock: product.variants.reduce((total, variant) => total + variant.stock, 0), // Total stock is sum of variant stock
    isArchived: product.isArchived,
    updatedAt: product.updatedAt,
    images: product.images.map((image) => ({
      id: image.id,
      url: image.url,
      alt: image.alt,
      sortOrder: image.sortOrder,
    })),
    variants: product.variants.map((variant) => ({
      id: variant.id,
      name: variant.name,
      sku: variant.sku,
      price: variant.price,
      stock: variant.stock,
    })),
  };
}