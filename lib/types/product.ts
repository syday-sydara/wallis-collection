// lib/types/products.ts
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

/* ---------------------------------- */
/* Product Image Type                 */
/* ---------------------------------- */

export type ProductImage = {
  url: string;
  position: number;
};

/* ---------------------------------- */
/* Product Review Type                */
/* ---------------------------------- */

export type ProductReview = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  userId: string | null;
};

/* ---------------------------------- */
/* Product Card (Listing)             */
/* ---------------------------------- */

export const productCardSelect = Prisma.validator<Prisma.ProductSelect>()({
  id: true,
  slug: true,
  name: true,
  priceNaira: true,
  salePriceNaira: true,
  category: true,
  stock: true,
  images: {
    select: {
      url: true,
      position: true,
    },
  },
});

export type ProductCard = Prisma.ProductGetPayload<{
  select: typeof productCardSelect;
}>;

/* ---------------------------------- */
/* Full Product Detail Type           */
/* ---------------------------------- */

export const productDetailInclude = Prisma.validator<Prisma.ProductInclude>()({
  images: true,
  reviews: true,
  inventory: true,
});

export type ProductDetail = Prisma.ProductGetPayload<{
  include: typeof productDetailInclude;
}>;

/* ---------------------------------- */
/* Query Helpers                      */
/* ---------------------------------- */

export async function getAllProducts(): Promise<ProductCard[]> {
  return prisma.product.findMany({
    select: productCardSelect,
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
  });
}

export async function getProductBySlug(
  slug: string
): Promise<ProductDetail | null> {
  return prisma.product.findUnique({
    where: { slug },
    include: productDetailInclude,
  });
}

export async function getFeaturedProducts(): Promise<ProductCard[]> {
  return prisma.product.findMany({
    select: productCardSelect,
    where: { featured: true, deletedAt: null },
    orderBy: { createdAt: "desc" },
  });
}

export async function getProductsByCategory(
  category: string
): Promise<ProductCard[]> {
  return prisma.product.findMany({
    select: productCardSelect,
    where: { category, deletedAt: null },
    orderBy: { createdAt: "desc" },
  });
}