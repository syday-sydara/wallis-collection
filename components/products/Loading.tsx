"use client";

import React, { useMemo } from "react";
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
  // Configure layouts per variant
  const variantConfig = useMemo(() => {
    return {
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
    }[variant];
  }, [variant]);

  // Generate skeletons
  const skeletons = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col gap-2 animate-pulse motion-reduce:animate-none transition-opacity duration-300 opacity-80"
          role="presentation"
        >
          <Skeleton className={variantConfig.image} />
          <Skeleton className="w-3/4 h-4" />
          <Skeleton className="w-1/2 h-4" />
          {variantConfig.extra && <Skeleton className="w-full h-10 rounded-md" />}
        </div>
      )),
    [count, variantConfig]
  );

  return (
    <div
      className={clsx("flex flex-col items-center", className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      {/* Skeleton Grid/List */}
      <div
        className={clsx("w-full mb-4", variantConfig.container)}
        aria-hidden="true"
      >
        {skeletons}
      </div>

      {/* Optional message */}
      {message ? (
        <p className="text-sm text-[var(--color-text-secondary)] mb-2">{message}</p>
      ) : (
        <span className="sr-only">Loading content</span>
      )}

      {/* Optional spinner */}
      {showSpinner && (
        <Spinner
          size="md"
          color="primary"
          aria-hidden={message ? true : undefined}
        />
      )}
    </div>
  );
}