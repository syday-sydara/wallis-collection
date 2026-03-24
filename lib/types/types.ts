import { Prisma, PaymentMethod, PaymentStatus, OrderStatus } from "@prisma/client";

/* -------------------------- */
/* Cart Types                  */
/* -------------------------- */
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

/* -------------------------- */
/* Cart Snapshot               */
/* -------------------------- */
export interface CartItemSnapshot {
  id: string;
  name: string;
  price: number;
  quantity: number;
  variants?: Record<string, string>;
  key: string;
}

/* -------------------------- */
/* Order Types                 */
/* -------------------------- */
export interface OrderItem {
  productId: string;
  quantity: number;
  price: number; // in Naira
}

export interface OrderSnapshot {
  items: CartItem[];
  total: number;
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
  total: number;
  currency: string;
  cartSnapshot?: CartItem[];
  createdAt: Date;
  updatedAt: Date;
  items: OrderItem[];
}