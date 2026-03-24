import { Prisma, PaymentMethod, PaymentStatus, OrderStatus } from "@prisma/client";

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
  userId?: string;
};

/* ---------------------------------- */
/* Product Types                      */
/* ---------------------------------- */
export const productCardSelect = Prisma.validator<Prisma.ProductSelect>()({
  id: true,
  name: true,
  slug: true,
  price: true,
  salePrice: true,
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

export type ProductWithCollection = Prisma.ProductGetPayload<{
  include: { images: true; reviews: true; collection: true };
}>;

/* ---------------------------------- */
/* Cart Types                         */
/* ---------------------------------- */
export interface CartItem {
  productId: string;
  name: string;
  price: number; // in Naira
  image?: string;
  quantity: number;
  variants?: Record<string, string>; // optional variant mapping
  key: string; // unique per product + variant
  addedAt: Date;
}

/* ---------------------------------- */
/* Order Types                        */
/* ---------------------------------- */
export interface OrderItem {
  productId: string;
  quantity: number;
  price: number; // in Naira
}

export interface OrderSnapshot {
  items: CartItem[];
  total: number; // in Naira
}

export interface CheckoutBody {
  items: CartItem[];
  email: string;
  phone: string;
  paymentMethod: PaymentMethod;
}

export interface OrderResponse {
  orderId: string;
  paymentUrl: string;
  cartSnapshot?: CartItem[];
}

export interface Order {
  id: string;
  userId?: string;
  email: string;
  phone?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  total: number; // in Naira
  currency: string;
  cartSnapshot?: CartItem[];
  createdAt: Date;
  updatedAt: Date;
  items: OrderItem[];
}