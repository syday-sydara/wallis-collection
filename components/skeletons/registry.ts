// components/skeletons/registry.ts
"use client";

import dynamic from "next/dynamic";
import FallbackSkeleton from "./FallbackSkeleton";

export const SkeletonRegistry = {
  ProductCard: dynamic(() => import("./ProductCardSkeleton"), { ssr: false }),
  ProductDetail: dynamic(() => import("./ProductDetailSkeleton"), { ssr: false }),
  CartPage: dynamic(() => import("./CartPageSkeleton"), { ssr: false }),

  // Fallback (not exposed as a key)
  _fallback: FallbackSkeleton,
} as const;

export type SkeletonKey = keyof typeof SkeletonRegistry;
