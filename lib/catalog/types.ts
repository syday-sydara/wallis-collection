// lib/catalog/types.ts

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
 * Recommended product simplified for product detail page
 */
export type RecommendedProduct = {
  id: string;
  name: string;
  slug: string;
  basePrice: number;       // in kobo
  images: {
    id: string;
    url: string;
    alt: string | null;
    sortOrder?: number;
  }[];
};

/**
 * Product detail response including recommendations
 */
export type ProductDetailResponse = {
  product: ProductWithRelations;
  recommendations: RecommendedProduct[];
};

/**
 * Cursor-based paginated product list result
 */
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

export function toProductCardVM(product: ProductWithRelations | RecommendedProduct) {
  const minPrice = "variants" in product && product.variants?.length
    ? Math.min(...product.variants.map(v => v.price))
    : product.basePrice;

  const maxPrice = "variants" in product && product.variants?.length
    ? Math.max(...product.variants.map(v => v.price))
    : product.basePrice;

  return {
    id: product.id,
    name: product.name,
    minPrice,
    maxPrice,
    inStock: "stock" in product ? product.stock > 0 : true,
    images: product.images,
  };
}


export type ProductClientVM = ProductWithRelations & {
  recommended?: RecommendedProduct[];
};