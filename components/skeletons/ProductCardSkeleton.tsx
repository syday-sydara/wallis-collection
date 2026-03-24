"use client";

import clsx from "clsx";

interface ProductCardSkeletonProps {
  variant?: "grid" | "list" | "compact";
  className?: string;
}

export default function ProductCardSkeleton({
  variant = "grid",
  className,
}: ProductCardSkeletonProps) {
  const imageClass = clsx({
    "h-64": variant === "grid",
    "h-32 w-full": variant === "list",
    "h-40": variant === "compact",
  });

  return (
    <div
      className={clsx(
        "bg-[var(--color-bg)] border border-[var(--color-neutral)]/20 rounded-[var(--radius-xl)] overflow-hidden shadow-soft animate-pulse transition-opacity duration-300 opacity-80",
        className
      )}
      role="status"
      aria-label="Loading product"
      aria-busy="true"
    >
      {/* Image placeholder */}
      <div
        className={clsx(
          "bg-[var(--color-neutral)]/10 skeleton-shimmer",
          imageClass
        )}
      />

      {/* Text placeholders */}
      <div className="p-4 space-y-4">
        <div className="h-4 w-4/5 bg-[var(--color-neutral)]/20 rounded-[var(--radius-sm)] skeleton-shimmer" />
        <div className="h-4 w-1/3 bg-[var(--color-neutral)]/20 rounded-[var(--radius-sm)] skeleton-shimmer" />

        {variant !== "compact" && (
          <div className="h-3 w-1/4 bg-[var(--color-neutral)]/20 rounded-[var(--radius-sm)] skeleton-shimmer" />
        )}
      </div>
    </div>
  );
}
