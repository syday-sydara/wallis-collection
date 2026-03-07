/**
 * Core type definitions for the application
 */

/* ---------------------------------- */
/* Product Types                      */
/* ---------------------------------- */

export type Product = {
  id: string;
  name: string;
  slug: string;
  priceNaira: number;
  images: string[];
  category?: string | null; // simplified for UI
  stock: number;
  createdAt: Date;
};

/**
 * Product shape used specifically for ProductCard
 * (matches the Prisma select in homepage)
 */
export type ProductCardData = {
  id: string;
  name: string;
  slug: string;
  priceNaira: number;
  images: string[];
  category: string | null;
  stock: number;
  createdAt: Date;
};

/* ---------------------------------- */
/* Cart Types                         */
/* ---------------------------------- */

export interface CartItem {
  productId: string;
  quantity: number;
  addedAt: Date;
}

/* ---------------------------------- */
/* Order Types                        */
/* ---------------------------------- */

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered";

/**
 * Lightweight order summary for UI lists
 */
export interface OrderSummary {
  id: string;
  totalCents: number;
  status: OrderStatus;
  createdAt: Date;
}