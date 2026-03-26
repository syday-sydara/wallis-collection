export interface CartItemSnapshot {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  variants?: Record<string, string>;
  addedAt: string; // ISO string for safe serialization
}
