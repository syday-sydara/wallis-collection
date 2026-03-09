"use client";

import React from "react";
import { cva, VariantProps } from "class-variance-authority";
import clsx from "clsx";

const input = cva(
  "w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-colors duration-200 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default:
          "border-[var(--color-border)] bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] focus:ring-[var(--color-primary-500)] hover:border-[var(--color-primary-500)]",
        subtle:
          "border-transparent bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] focus:ring-[var(--color-primary-500)] hover:border-[var(--color-primary-500)]",
        outline:
          "border-[var(--color-primary-500)] bg-white text-[var(--color-text-primary)] focus:ring-[var(--color-primary-500)] hover:border-[var(--color-accent-500)]",
        error:
          "border-[var(--color-danger-500)] bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] focus:ring-[var(--color-danger-500)] hover:border-[var(--color-danger-500)]",
      },
      size: {
        sm: "text-xs px-2 py-1",
        md: "text-sm px-3 py-2",
        lg: "text-base px-4 py-3",
      },
      rounded: {
        sm: "rounded-sm",
        md: "rounded-md",
        lg: "rounded-lg",
        full: "rounded-full",
      },
      fullWidth: {
        true: "w-full",
        false: "w-auto",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      rounded: "md",
      fullWidth: true,
    },
  }
);

interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof input> {}

export default function Input({
  variant,
  size,
  rounded,
  fullWidth,
  className,
  ...props
}: InputProps) {
  return (
    <input
      className={clsx(input({ variant, size, rounded, fullWidth }), className)}
      aria-invalid={variant === "error" ? true : undefined}
      {...props}
    />
  );
}
