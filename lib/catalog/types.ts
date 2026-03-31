// lib/catalog/types.ts

/**
 * Parameters for listing products with optional filters and pagination
 */
export type ProductListParams = {
  search?: string;
  minPrice?: number;       // minimum price in kobo
  maxPrice?: number;       // maximum price in kobo
  includeArchived?: boolean;
  limit?: number;          // page size, default to 24
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
  stock: number;           // currently unused (O(1) service)
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  images: {
    id: string;
    url: string;
    alt: string | null;
    sortOrder?: number;
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