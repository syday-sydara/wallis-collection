// lib/catalog/types.ts

/**
 * Parameters for listing products with optional filters and pagination
 */
export type ProductListParams = {
  search?: string;
  minPrice?: number;       // minimum price in kobo
  maxPrice?: number;       // maximum price in kobo
  includeArchived?: boolean;
  limit?: number;          // page size, default to 24 or similar
  cursor?: string;         // for cursor-based pagination
};

/**
 * Represents a product including related entities
 */
export type ProductWithRelations = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  basePrice: number;       // in kobo
  stock: number;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  images: {
    id: string;
    url: string;
    alt: string | null;
    sortOrder?: number;     // optional if used for ordering
  }[];
  variants: {
    id: string;
    name: string;
    sku: string;
    price: number;         // in kobo
  }[];
};

/**
 * Cursor-based paginated product list result
 */
export type ProductListResult = {
  items: ProductWithRelations[];
  nextCursor: string | null;
};