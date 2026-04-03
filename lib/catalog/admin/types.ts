// lib/products/types.ts
export type AdminProductSummary = {
  id: string;
  name: string;
  slug: string;
  basePrice: number | null; // basePrice can now be null
  stock: number;
  isArchived: boolean;
  updatedAt: Date;
};

export type AdminProductDetail = {
  id: string;
  name: string;
  slug: string;
  description: string | null; // description can also be null
  basePrice: number | null; // basePrice can now be null
  stock: number;
  isArchived: boolean;
  updatedAt: Date;
  images: {
    id: string;
    url: string;
    alt: string | null;
    sortOrder: number;
  }[];
  variants: {
    id: string;
    name: string;
    sku: string;
    price: number;
    stock: number;
  }[];
};