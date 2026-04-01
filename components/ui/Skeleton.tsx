"use client";

import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const skeletonVariants = cva(
  "w-full rounded-md bg-surface-muted animate-pulse leading-none",
  {
    variants: {
      variant: {
        rect: "",
        text: "h-3 rounded",
        circle: "rounded-full",
      },
      size: {
        sm: "h-3",
        md: "h-4",
        lg: "h-6",
      },
    },
    defaultVariants: {
      variant: "rect",
      size: "md",
    },
  }
);

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {}

export function Skeleton({ className, variant, size, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        skeletonVariants({ variant, size }),
        "animate-fadeIn-fast",
        className
      )}
      {...props}
    />
  );
}
