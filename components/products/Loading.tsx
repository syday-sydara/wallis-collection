"use client";

import React from "react";
import Skeleton from "@/components/ui/Skeleton";
import Spinner from "@/components/ui/Spinner";
import clsx from "clsx";

interface LoadingProps {
  count?: number;
  showSpinner?: boolean;
  message?: string;
  variant?: "grid" | "list" | "compact";
  className?: string;
}

export default function Loading({
  count = 8,
  showSpinner = true,
  message,
  variant = "grid",
  className,
}: LoadingProps) {
  const skeletons = Array.from({ length: count }, (_, i) => {
    const imageClass = clsx({
      "aspect-[3/4] w-full": variant === "grid",
      "h-24 w-24 rounded-md": variant === "list",
      "h-20 w-full rounded-md": variant === "compact",
    });

    return (
      <div
        key={i}
        className="flex flex-col gap-3 animate-pulse transition-opacity duration-300 opacity-80"
        aria-hidden="true"
      >
        <Skeleton shape="block" size="full" className={imageClass} />

        <Skeleton shape="text" size="full" className="w-3/4" />
        <Skeleton shape="text" size="md" className="w-1/2" />

        {variant === "grid" && (
          <Skeleton shape="block" size="sm" className="w-full h-10" />
        )}
      </div>
    );
  });

  return (
    <div
      className={clsx("flex flex-col items-center", className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div
        className={clsx(
          "w-full mb-4",
          variant === "grid" &&
            "grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4",
          variant === "list" && "flex flex-col gap-4",
          variant === "compact" &&
            "grid grid-cols-3 gap-4 sm:grid-cols-4"
        )}
      >
        {skeletons}
      </div>

      {message && (
        <p className="text-neutral-600 text-sm mb-2">{message}</p>
      )}

      {showSpinner && <Spinner size="md" color="primary" />}
    </div>
  );
}
