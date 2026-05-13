export interface ProductVariant {
  id: string;
  sku: string;

  // Current stock level
  stockQty: number;

  // Variant‑specific price override (null = use product.basePrice)
  price?: number | null;

  // Optional: size, color, weight, etc.
  attributes?: Record<string, string> | null;

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
  description?: string | null;

  // Optional: product images
  images?: string[] | null;

  // Variants
  variants: ProductVariant[];

  // Timestamps
  createdAt: string;
  updatedAt: string;
}
