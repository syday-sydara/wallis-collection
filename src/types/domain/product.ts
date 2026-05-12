export interface ProductVariant {
  id: string;
  sku: string;

  // Inventory
  stockQty: number;

  // Variant‑specific price (optional override)
  price: number;

  // Optional: size, color, weight, etc.
  attributes?: Record<string, string>;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;

  // Base price if variant doesn't override
  basePrice: number;

  // Optional: product description
  description?: string;

  // Optional: product images
  images?: string[];

  // Variants
  variants: ProductVariant[];

  // Timestamps
  createdAt: string;
  updatedAt: string;
}
