"use client";

import React from "react";
import Skeleton from "@/components/ui/Skeleton";
import Spinner from "@/components/ui/Spinner";
import clsx from "clsx";

export interface LoadingProps {
  count?: number;
  showSpinner?: boolean;
  message?: string | null;
  variant?: "grid" | "list" | "compact";
  className?: string;
}

export default function Loading({
  count = 8,
  showSpinner = true,
  message = null,
  variant = "grid",
  className,
}: LoadingProps) {
  const variantConfig = {
    grid: {
      container: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-[var(--spacing-md)]",
      image: "aspect-[3/4] w-full rounded-lg",
      extra: true,
    },
    list: {
      container: "flex flex-col gap-[var(--spacing-sm)]",
      image: "h-24 w-24 rounded-md",
      extra: false,
    },
    compact: {
      container: "grid grid-cols-3 sm:grid-cols-4 gap-[var(--spacing-sm)]",
      image: "h-20 w-full rounded-md",
      extra: false,
    },
  }[variant];

  return (
    <div
      className={clsx("flex flex-col items-center", className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
      data-variant={variant}
      data-count={count}
    >
      <div className={clsx("w-full mb-4", variantConfig.container)} aria-hidden="true">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2 transition-opacity duration-300">
            <Skeleton className={variantConfig.image} />
            <Skeleton className="w-3/4 h-4" />
            <Skeleton className="w-1/2 h-4" />
            {variantConfig.extra && <Skeleton className="w-full h-10 rounded-md" />}
          </div>
        ))}
      </div>

      {message ? (
        <p className="text-sm text-[var(--color-text-secondary)] mb-2">{message}</p>
      ) : (
        <span className="sr-only">Loading content</span>
      )}

      {showSpinner && (
        <Spinner size="md" color="primary" aria-hidden={!!message} />
      )}
    </div>
  );
}
