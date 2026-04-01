// lib/catalog/types.ts

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

export function toProductCardVM(product: ProductWithRelations | RecommendedProduct) {
  const variants = "variants" in product ? product.variants : [];
  const hasVariants = variants.length > 0;

  const minPrice = hasVariants
    ? Math.min(...variants.map(v => v.price))
    : product.basePrice ?? 0;

  const maxPrice = hasVariants
    ? Math.max(...variants.map(v => v.price))
    : product.basePrice ?? 0;

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
