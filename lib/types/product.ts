// File: lib/types/product.ts
import { Prisma } from "@prisma/client";
import { formatKobo } from "./formatters";

/* -------------------------- */
/* Product Image Type          */
/* -------------------------- */
export type ProductImage = {
  id: string;
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
  createdAt: string; // ISO string
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
  salePrice: true,
  category: true,
  stock: true,
  isNew: true,
  isOnSale: true,
  featured: true,
  images: { select: { id: true, url: true, position: true }, orderBy: { position: "asc" } },
});

export type ProductCard = Prisma.ProductGetPayload<{
  select: typeof productCardSelect;
}>;

/* -------------------------- */
/* Product Detail Type         */
/* -------------------------- */
export const productDetailInclude = Prisma.validator<Prisma.ProductInclude>()({
  images: { orderBy: { position: "asc" } },
  reviews: { include: { user: { select: { id: true, name: true } } } },
  inventory: true,
});

export type ProductDetail = Prisma.ProductGetPayload<{
  include: typeof productDetailInclude;
}>;

/* -------------------------- */
/* Helpers                     */
/* -------------------------- */
export const getCurrentPrice = (product: { price: number; salePrice?: number | null }) =>
  product.salePrice ?? product.price;

export const getPrimaryImage = (images?: ProductImage[]) =>
  images?.sort((a, b) => a.position - b.position)[0]?.url ?? "/fallback-product.jpg";

export const getStock = (product: ProductCard | ProductDetail) =>
  "stock" in product ? product.stock : product.inventory?.quantity ?? 0;

/**
 * Return formatted NGN price strings
 */
export const getFormattedPrice = (product: { price: number; salePrice?: number | null }) => {
  const mainPrice = formatKobo(product.price);
  if (product.salePrice && product.salePrice < product.price) {
    return { price: mainPrice, salePrice: formatKobo(product.salePrice) };
  }
  return { price: mainPrice };
};