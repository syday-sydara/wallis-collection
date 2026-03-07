/**
 * Core type definitions for the application
 */

export type Product = {
  id: string;
  name: string;
  slug: string;
  priceNaira: number;
  images: string[];
  category?: string | null;
  stock: number;
};

export interface CartItem {
  productId: string;
  quantity: number;
  addedAt: Date;
}

export interface Order {
  id: string;
  totalCents: number;
  status: "pending" | "confirmed" | "shipped" | "delivered";
  createdAt: Date;
}
