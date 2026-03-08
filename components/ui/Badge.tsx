"use client";

import React from "react";
import { cva, VariantProps } from "class-variance-authority";
import clsx from "clsx";

const badge = cva(
  "inline-flex items-center font-medium rounded-full",
  {
    variants: {
      variant: {
        default: "bg-[color:var(--color-text-muted)]/20 text-[color:var(--color-text-secondary)]",
        success: "bg-[color:var(--color-success-500)]/10 text-[color:var(--color-success-500)]",
        warning: "bg-[color:var(--color-warning-500)]/10 text-[color:var(--color-warning-500)]",
        danger: "bg-[color:var(--color-danger-500)]/10 text-[color:var(--color-danger-500)]",
      },
      size: {
        sm: "text-xs px-2 py-1",
        md: "text-sm px-2.5 py-1",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "sm",
    },
  }
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badge> {}

export default function Badge({
  children,
  variant,
  size,
  className,
  ...props
}: BadgeProps) {
  return (
    <span className={clsx(badge({ variant, size }), className)} {...props}>
      {children}
    </span>
  );
}