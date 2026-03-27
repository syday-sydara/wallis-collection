"use client";

import React from "react";
import Skeleton from "@/components/ui/Skeleton";
import Spinner from "@/components/ui/Spinner";
import clsx from "clsx";

const VARIANTS = {
  grid: {
    container:
      "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-[var(--spacing-md)]",
    image: "aspect-[3/4] w-full rounded-[var(--radius-lg)]",
    extra: true,
  },
  list: {
    container: "flex flex-col gap-[var(--spacing-sm)]",
    image: "h-24 w-24 rounded-[var(--radius-md)]",
    extra: false,
  },
  compact: {
    container: "grid grid-cols-3 sm:grid-cols-4 gap-[var(--spacing-sm)]",
    image: "h-20 w-full rounded-[var(--radius-md)]",
    extra: false,
  },
} as const;

export interface LoadingProps {
  count?: number;
  showSpinner?: boolean;
  message?: string | null;
  variant?: keyof typeof VARIANTS;
  className?: string;
}

export default function Loading({
  count = 8,
  showSpinner = true,
  message = null,
  variant = "grid",
  className,
}: LoadingProps) {
  const config = VARIANTS[variant];

  return (
    <div
      className={clsx(
        "flex flex-col items-center animate-pulse opacity-80",
        className
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
      data-loading-variant={variant}
      data-loading-count={count}
    >
      {/* Skeleton Grid/List */}
      <div
        className={clsx("w-full mb-[var(--spacing-md)]", config.container)}
        aria-hidden="true"
      >
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-2 transition-opacity duration-300"
          >
            <Skeleton className={config.image} />
            <Skeleton className="w-3/4 h-4 rounded-[var(--radius-md)]" />
            <Skeleton className="w-1/2 h-4 rounded-[var(--radius-md)]" />
            {config.extra && (
              <Skeleton className="w-full h-10 rounded-[var(--radius-md)]" />
            )}
          </div>
        ))}
      </div>

      {/* Optional message */}
      {message ? (
        <p className="text-sm text-[var(--color-text-secondary)] mb-2">
          {message}
        </p>
      ) : (
        <span className="sr-only">Loading content</span>
      )}

      {/* Optional spinner */}
      {showSpinner && (
        <div className="mt-2">
          <Spinner size="md" color="primary" aria-hidden={!!message} />
        </div>
      )}
    </div>
  );
}
