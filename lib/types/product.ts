import { Prisma } from "@prisma/client";

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
  createdAt: string; // serialized ISO string
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
  images: { orderBy: { position: "asc" } },
  reviews: {
    include: { user: { select: { id: true, name: true } } },
  },
  inventory: true,
});

export type ProductDetail = Prisma.ProductGetPayload<{
  include: typeof productDetailInclude;
}>;

/* -------------------------- */
/* Helpers                     */
/* -------------------------- */
export const getCurrentPrice = (price: number, salePrice?: number) =>
  (salePrice ?? price) / 100;

export const getProductPrice = (product: ProductCard | ProductDetail) =>
  getCurrentPrice(product.price, product.salePrice);

export const getPrimaryImage = (images?: ProductImage[]) =>
  images?.sort((a, b) => a.position - b.position)[0]?.url ??
  "/fallback-product.jpg";

export const getStock = (product: ProductCard | ProductDetail) =>
  "stock" in product
    ? product.stock
    : product.inventory?.quantity ?? 0;
