"use client";

import React from "react";
import { cva, VariantProps } from "class-variance-authority";
import clsx from "clsx";

const skeleton = cva(
  "bg-[var(--color-neutral-100)] transition-colors duration-200",
  {
    variants: {
      shape: {
        block: "rounded-[var(--radius-sm)]",
        circle: "rounded-full",
        text: "h-4 rounded-sm",
      },
      size: {
        sm: "h-4 w-16",
        md: "h-6 w-32",
        lg: "h-8 w-64",
        full: "w-full h-6",
      },
      animation: {
        shimmer: "animate-shimmer",
        pulse: "animate-pulse",
        none: "",
      },
      margin: {
        none: "",
        sm: "my-[var(--spacing-sm)]",
        md: "my-[var(--spacing-md)]",
        lg: "my-[var(--spacing-lg)]",
      },
    },
    defaultVariants: {
      shape: "block",
      size: "full",
      animation: "shimmer",
      margin: "none",
    },
  }
);

interface SkeletonProps extends VariantProps<typeof skeleton> {
  className?: string;
}

export default function Skeleton({
  shape,
  size,
  animation,
  margin,
  className,
}: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      role="presentation"
      className={clsx(skeleton({ shape, size, animation, margin }), className)}
    />
  );
}
