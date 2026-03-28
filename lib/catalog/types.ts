// lib/catalog/types.ts

export type ProductListParams = {
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  includeArchived?: boolean;
  limit?: number;
  cursor?: string;
};

export type ProductWithRelations = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  basePrice: number;
  stock: number;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
  images: {
    id: string;
    url: string;
    alt: string | null;
  }[];
  variants: {
    id: string;
    name: string;
    sku: string;
    price: number;
  }[];
};
