"use client";

import React from "react";
import { cva, VariantProps } from "class-variance-authority";
import clsx from "clsx";

const skeleton = cva("animate-shimmer bg-[color:var(--color-neutral-100)]", {
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
  },
  defaultVariants: {
    shape: "block",
    size: "full",
  },
});

interface SkeletonProps extends VariantProps<typeof skeleton> {
  className?: string;
}

export default function Skeleton({ shape, size, className }: SkeletonProps) {
  return <div className={clsx(skeleton({ shape, size }), className)} />;
}