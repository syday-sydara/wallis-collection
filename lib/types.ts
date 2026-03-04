/**
 * Core type definitions for the application
 */

export interface Product {
  id: string;
  name: string;
  slug: string;
  priceCents: number;
  stock: number;
  images: string[];
  category?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

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
