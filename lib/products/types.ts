// Admin types
export type AdminProductSummary = {
  id: string;
  name: string;
  slug: string;
  basePrice: number | null; // can be null
  stock: number;
  isArchived: boolean;
  updatedAt: Date;
};

export type AdminProductDetail = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  basePrice: number | null;
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

// Storefront / general types
export type ProductImage = {
  id: string;
  url: string;
  alt: string | null;
  sortOrder: number;
};

export type ProductVariant = {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
};

export type ProductWithRelations = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  basePrice: number | null;
  stock: number;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
  images: ProductImage[];
  variants: ProductVariant[];
};

export type RecommendedProduct = {
  id: string;
  name: string;
  slug: string;
  basePrice: number | null;
  images: ProductImage[];
};

export type ProductDetailResponse = {
  product: ProductWithRelations;
  recommendations: RecommendedProduct[];
};

export type ProductListResult = {
  items: ProductWithRelations[];
  nextCursor: string | null;
};

export type ProductListParams = {
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  includeArchived?: boolean;
  limit?: number;
  cursor?: string;
};

export type ProductClientVM = ProductWithRelations & {
  recommended?: RecommendedProduct[];
};