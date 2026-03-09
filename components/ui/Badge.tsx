"use client";

import React from "react";
import { cva, VariantProps } from "class-variance-authority";
import clsx from "clsx";

const badge = cva(
  "inline-flex items-center font-medium transition-colors duration-200",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--color-border)]/20 text-[var(--color-text-secondary)]",
        success:
          "bg-[var(--color-success-500)]/10 text-[var(--color-success-500)]",
        warning:
          "bg-[var(--color-warning-500)]/10 text-[var(--color-warning-500)]",
        danger:
          "bg-[var(--color-danger-500)]/10 text-[var(--color-danger-500)]",
      },
      size: {
        sm: "text-xs px-2 py-0.5",
        md: "text-sm px-3 py-1",
        lg: "text-base px-4 py-1.5",
      },
      rounded: {
        sm: "rounded-sm",
        md: "rounded-md",
        lg: "rounded-lg",
        full: "rounded-full",
      },
      uppercase: {
        true: "uppercase tracking-wide",
        false: "",
      },
      interactive: {
        true: "cursor-pointer hover:opacity-80",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "sm",
      rounded: "full",
      uppercase: false,
      interactive: false,
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
  rounded,
  uppercase,
  interactive,
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={clsx(
        badge({ variant, size, rounded, uppercase, interactive }),
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
