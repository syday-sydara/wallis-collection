/**
 * Core type definitions for the application
 */

export type Product = {
  id: string;
  name: string;
  slug: string;
  priceNaira: number; // integer, in naira (not kobo)
  images: string[];
  category?: string | null;
  stock: number;
};

export interface CartItem {
  productId: string;
  quantity: number;
  addedAt: Date;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered";

export interface Order {
  id: string;
  totalCents: number; // stored in kobo/cents for accuracy
  status: OrderStatus;
  createdAt: Date;
}