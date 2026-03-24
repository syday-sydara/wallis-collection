import { Prisma } from "@prisma/client";

/* ---------------------------------- */
/* Product Image Type                 */
/* ---------------------------------- */

export type ProductImage = {
  id?: string;
  url: string;
  position?: number;
};

/* ---------------------------------- */
/* Product Review Type                */
/* ---------------------------------- */

export type ProductReview = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  userId: string;
};

/* ---------------------------------- */
/* Product Types                      */
/* ---------------------------------- */

export const productCardSelect = Prisma.validator<Prisma.ProductSelect>()({
  id: true,
  name: true,
  slug: true,
  priceNaira: true,
  salePriceNaira: true,
  category: true,
  stock: true,
  createdAt: true,
  images: {
    select: {
      url: true,
      position: true,
    },
  },
});

export type ProductCardData = Prisma.ProductGetPayload<{
  select: typeof productCardSelect;
}>;

export type Product = Prisma.ProductGetPayload<{
  include: { images: true; reviews: true };
}>;

/* ---------------------------------- */
/* Collection Types                   */
/* ---------------------------------- */

export type Collection = Prisma.CollectionGetPayload<{
  include: { products: true };
}>;

export type CollectionSummary = Prisma.CollectionGetPayload<{
  select: { id: true; name: true; slug: true; description: true };
}>;

/* ---------------------------------- */
/* Product + Collection Combined      */
/* ---------------------------------- */

export type ProductWithCollection = Prisma.ProductGetPayload<{
  include: { images: true; reviews: true; collection: true };
}>;

/* ---------------------------------- */
/* Cart Types                         */
/* ---------------------------------- */

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  addedAt: Date;
}

/* ---------------------------------- */
/* Order Types                        */
/* ---------------------------------- */

export type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export interface OrderSummary {
  id: string;
  totalCents: number;
  status: OrderStatus;
  createdAt: Date;
}