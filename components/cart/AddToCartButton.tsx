"use client";

import React from "react";
import Skeleton from "@/components/ui/Skeleton";
import Spinner from "@/components/ui/Spinner";
import clsx from "clsx";

const VARIANTS = {
  grid: {
    container: "grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4",
    image: "aspect-[3/4] w-full rounded-lg",
    extra: true,
  },
  list: {
    container: "flex flex-col gap-4",
    image: "h-24 w-24 rounded-md",
    extra: false,
  },
  compact: {
    container: "grid grid-cols-3 gap-4 sm:grid-cols-4",
    image: "h-20 w-full rounded-md",
    extra: false,
  },
};

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
      className={clsx("flex flex-col items-center", className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      {/* Skeleton Grid/List */}
      <div className={clsx("w-full mb-4", config.container)} aria-hidden="true">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-2 animate-pulse motion-reduce:animate-none opacity-80"
          >
            <Skeleton className={config.image} />
            <Skeleton className="w-3/4 h-4" />
            <Skeleton className="w-1/2 h-4" />
            {config.extra && <Skeleton className="w-full h-10 rounded-md" />}
          </div>
        ))}
      </div>

      {/* Optional message */}
      {message ? (
        <p className="text-sm text-text-secondary mb-2">{message}</p>
      ) : (
        <span className="sr-only">Loading content</span>
      )}

      {/* Optional spinner */}
      {showSpinner && (
        <div className="mt-2">
          <Spinner size="md" color="primary" />
        </div>
      )}
    </div>
  );
}