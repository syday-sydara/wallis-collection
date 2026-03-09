"use client";

import clsx from "clsx";

interface ProductDetailSkeletonProps {
  variant?: "default" | "compact";
  className?: string;
}

export default function ProductDetailSkeleton({
  variant = "default",
  className,
}: ProductDetailSkeletonProps) {
  const imageClass = clsx({
    "h-[500px]": variant === "default",
    "h-80": variant === "compact",
  });

  const relatedCount = variant === "compact" ? 3 : 4;

  return (
    <div
      className={clsx(
        "animate-pulse transition-opacity duration-300 opacity-80 space-y-24 py-20",
        className
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      {/* Main Product Section */}
      <div
        className={clsx(
          "grid gap-20",
          variant === "compact" ? "md:grid-cols-1" : "md:grid-cols-2"
        )}
      >
        {/* Image Placeholder */}
        <div
          className={clsx(
            "bg-[var(--color-neutral)]/10 rounded-[var(--radius-xl)] skeleton-shimmer",
            imageClass
          )}
        />

        {/* Product Info Placeholder */}
        <div className="space-y-8">
          <div className="h-4 w-28 bg-[var(--color-neutral)]/20 rounded-[var(--radius-sm)] skeleton-shimmer" />
          <div className="h-10 w-3/4 bg-[var(--color-neutral)]/20 rounded-[var(--radius-md)] skeleton-shimmer" />
          <div className="h-6 w-1/3 bg-[var(--color-neutral)]/20 rounded-[var(--radius-sm)] skeleton-shimmer" />

          <div className="space-y-3">
            <div className="h-4 w-full bg-[var(--color-neutral)]/10 rounded-[var(--radius-sm)] skeleton-shimmer" />
            <div className="h-4 w-5/6 bg-[var(--color-neutral)]/10 rounded-[var(--radius-sm)] skeleton-shimmer" />
            <div className="h-4 w-2/3 bg-[var(--color-neutral)]/10 rounded-[var(--radius-sm)] skeleton-shimmer" />
          </div>

          <div className="h-12 w-40 bg-[var(--color-neutral)]/20 rounded-[var(--radius-md)] skeleton-shimmer" />
        </div>
      </div>

      {/* Related Products Section */}
      <div className="space-y-10">
        <div className="h-6 w-48 bg-[var(--color-neutral)]/20 rounded-[var(--radius-sm)] skeleton-shimmer" />

        <div
          className={clsx(
            "grid gap-10",
            variant === "compact"
              ? "grid-cols-2 sm:grid-cols-3"
              : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
          )}
        >
          {Array.from({ length: relatedCount }).map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="h-64 bg-[var(--color-neutral)]/10 rounded-[var(--radius-xl)] skeleton-shimmer" />
              <div className="h-4 w-3/4 bg-[var(--color-neutral)]/20 rounded-[var(--radius-sm)] skeleton-shimmer" />
              <div className="h-4 w-1/2 bg-[var(--color-neutral)]/20 rounded-[var(--radius-sm)] skeleton-shimmer" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
