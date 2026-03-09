"use client";

import React from "react";
import { cva, VariantProps } from "class-variance-authority";
import clsx from "clsx";

const label = cva(
  "block font-medium transition-colors duration-200",
  {
    variants: {
      size: {
        sm: "text-xs",
        md: "text-sm",
        lg: "text-base",
      },
      variant: {
        default: "text-[var(--color-text-secondary)] hover:text-[var(--color-accent-500)]",
        subtle: "text-[var(--color-text-muted)] hover:text-[var(--color-accent-500)]",
        accent: "text-[var(--color-accent-500)]",
      },
      uppercase: {
        true: "uppercase tracking-widest",
        false: "",
      },
      required: {
        true: "after:content-['*'] after:ml-1 after:text-[var(--color-danger-500)]",
        false: "",
      },
    },
    defaultVariants: {
      size: "sm",
      variant: "default",
      uppercase: true,
      required: false,
    },
  }
);

interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement>,
    VariantProps<typeof label> {}

export default function Label({
  children,
  size,
  variant,
  uppercase,
  required,
  className,
  ...props
}: LabelProps) {
  return (
    <label className={clsx(label({ size, variant, uppercase, required }), className)} {...props}>
      {children}
    </label>
  );
}