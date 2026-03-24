import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

/* -------------------------- */
/* Product Image Type          */
/* -------------------------- */
export type ProductImage = {
  id?: string;
  url: string;
  position: number;
};

/* -------------------------- */
/* Product Review Type         */
/* -------------------------- */
export type ProductReview = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  user: { id: string; name: string } | null;
};

/* -------------------------- */
/* Product Card Type           */
/* -------------------------- */
export const productCardSelect = Prisma.validator<Prisma.ProductSelect>()({
  id: true,
  slug: true,
  name: true,
  price: true,
  salePriceNaira: true,
  category: true,
  stock: true,
  isNew: true,
  isOnSale: true,
  featured: true,
  images: {
    select: { id: true, url: true, position: true },
    orderBy: { position: "asc" },
  },
});

export type ProductCard = Prisma.ProductGetPayload<{
  select: typeof productCardSelect;
}>;

/* -------------------------- */
/* Product Detail Type         */
/* -------------------------- */
export const productDetailInclude = Prisma.validator<Prisma.ProductInclude>()({
  images: true,
  reviews: { include: { user: { select: { id: true, name: true } } } }, // ✅ comma fixed
  inventory: true,
});

export type ProductDetail = Prisma.ProductGetPayload<{
  include: typeof productDetailInclude;
}>;

/* -------------------------- */
/* Helpers                     */
/* -------------------------- */
export const getCurrentPrice = (product: ProductCard | ProductDetail) =>
  product.salePriceNaira ?? product.priceNaira;

export const getPrimaryImage = (images?: ProductImage[]) =>
  images?.[0]?.url ?? "/fallback-product.jpg";