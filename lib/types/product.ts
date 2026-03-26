// PATH: lib/types/product.ts

import { PaymentMethod, PaymentStatus, OrderStatus } from "@prisma/client";

/* -------------------------- */
/* Product Type (UI Layer)    */
/* -------------------------- */
export interface Product {
  id: string;
  name: string;
  slug: string;

  price: number;
  salePrice?: number | null;

  images: { url: string }[];

  isNew: boolean;
  isOnSale: boolean;

  stock: number;
  sizes?: string[];
}

/* -------------------------- */
/* Helper: Get Primary Image  */
/* -------------------------- */
/**
 * Returns the first product image or a fallback placeholder.
 * This keeps your UI components clean and avoids null checks everywhere.
 */
export function getPrimaryImage(
  images: { url: string }[] | undefined | null
): string {
  if (!images || images.length === 0) {
    return "/placeholder.png"; // fallback image
  }
  return images[0].url;
}

/* -------------------------- */
/* Cart Types                 */
/* -------------------------- */
export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
  variants?: Record<string, string>;
  key: string;
  addedAt: string;
}

/* -------------------------- */
/* Cart Snapshot (for orders) */
/* -------------------------- */
export interface CartItemSnapshot {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  variants?: Record<string, string>;
}

/* -------------------------- */
/* Order Types                */
/* -------------------------- */
export interface OrderItem {
  productId: string;
  name: string;
  image?: string;
  quantity: number;
  price: number;
}

export interface OrderSnapshot {
  items: CartItemSnapshot[];
  total: number;
}

export interface CheckoutBody {
  items: CartItemSnapshot[];
  email: string;
  phone: string;
  paymentMethod: PaymentMethod;
  total: number;
}

export interface OrderResponse {
  orderId: string;
  paymentUrl: string;
  cartSnapshot?: CartItemSnapshot[];
}

export interface Order {
  id: string;
  userId?: string;
  email: string;
  phone?: string;

  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;

  total: number;
  currency: string;

  cartSnapshot?: CartItemSnapshot[];

  createdAt: Date;
  updatedAt: Date;

  items: OrderItem[];
}

/* ------------------------------------------------------------
   Product Detail Props (UI Layer)
------------------------------------------------------------- */
export interface ProductDetailProps {
  id: string;
  name: string;
  slug: string;
  description: string | null;

  images: { url: string }[];

  price: number;
  salePrice?: number | null;
  isOnSale: boolean;

  isNew: boolean;

  stock: number;

  variants: {
    id: string;
    size: string | null;
    color: string | null;
    stock: number;
  }[];

  sizes: string[];

  reviews: {
    id: string;
    rating: number;
    comment: string | null;
    createdAt: Date;
    user: {
      id: string;
      name: string | null;
    } | null;
  }[];
}
