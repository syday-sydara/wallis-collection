import { Prisma, PaymentMethod, PaymentStatus, OrderStatus } from "@prisma/client";

/* -------------------------- */
/* Product Type               */
/* -------------------------- */
export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  salePrice?: number;
  images: { url: string }[];
  isNew: boolean;
  isOnSale: boolean;
  stock: number;
}

/* -------------------------- */
/* Cart Types                 */
/* -------------------------- */
export interface CartItem {
  productId: string;
  name: string;
  price: number; // in Naira
  image?: string;
  quantity: number;
  variants?: Record<string, string>;
  key: string; // unique per product + variant
  addedAt: string; // ISO string for safe serialization
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
  price: number; // in Naira
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
  total: number; // client-side total for validation
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