"use client";

import clsx from "clsx";

interface CartPageSkeletonProps {
  variant?: "default" | "compact";
  className?: string;
}

export default function CartPageSkeleton({
  variant = "default",
  className,
}: CartPageSkeletonProps) {
  return (
    <div
      className={clsx(
        "animate-pulse transition-opacity duration-300 opacity-80 container py-20 space-y-16",
        className
      )}
      role="status"
      aria-live="polite"
    >
      {/* Page Title */}
      <div className="h-10 w-48 bg-[var(--color-neutral)]/20 rounded-[var(--radius-md)] skeleton-shimmer" />

      <div className="grid lg:grid-cols-3 gap-16">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-10">
          {Array.from({ length: variant === "compact" ? 2 : 3 }).map((_, i) => (
            <div
              key={i}
              className="flex gap-6 border-b border-[var(--color-neutral)]/20 pb-10"
            >
              {/* Image Placeholder */}
              <div className="w-28 h-28 bg-[var(--color-neutral)]/10 rounded-[var(--radius-lg)] skeleton-shimmer" />

              {/* Text + Controls */}
              <div className="flex-1 space-y-5">
                {/* Product Name */}
                <div className="h-4 w-2/3 bg-[var(--color-neutral)]/20 rounded-[var(--radius-sm)] skeleton-shimmer" />

                {/* Price */}
                <div className="h-4 w-1/3 bg-[var(--color-neutral)]/20 rounded-[var(--radius-sm)] skeleton-shimmer" />

                {/* Quantity Selector */}
                <div className="h-10 w-40 bg-[var(--color-neutral)]/10 rounded-[var(--radius-md)] skeleton-shimmer" />
              </div>
            </div>
          ))}
        </div>

        {/* Summary Card */}
        <div className="border border-[var(--color-neutral)]/20 rounded-[var(--radius-xl)] p-6 shadow-soft space-y-8 h-fit">
          {/* Summary Title */}
          <div className="h-6 w-1/3 bg-[var(--color-neutral)]/20 rounded-[var(--radius-sm)] skeleton-shimmer" />

          {/* Subtotal */}
          <div className="h-4 w-full bg-[var(--color-neutral)]/20 rounded-[var(--radius-sm)] skeleton-shimmer" />

          {/* Shipping */}
          <div className="h-4 w-3/4 bg-[var(--color-neutral)]/20 rounded-[var(--radius-sm)] skeleton-shimmer" />

          {/* Total */}
          <div className="h-4 w-1/2 bg-[var(--color-neutral)]/20 rounded-[var(--radius-sm)] skeleton-shimmer" />

          {/* Checkout Button */}
          <div className="h-12 w-full bg-[var(--color-neutral)]/20 rounded-[var(--radius-md)] skeleton-shimmer" />
        </div>
      </div>
    </div>
  );
}
