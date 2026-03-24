import ProductCardSkeleton from "./ProductCardSkeleton";
import ProductDetailSkeleton from "./ProductDetailSkeleton";
import CartPageSkeleton from "./CartPageSkeleton";

export const SkeletonRegistry = {
  ProductCard: ProductCardSkeleton,
  ProductDetail: ProductDetailSkeleton,
  CartPage: CartPageSkeleton,
  // Add more as needed
};

export type SkeletonKey = keyof typeof SkeletonRegistry;
