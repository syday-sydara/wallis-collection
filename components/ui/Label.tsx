"use client";

import React from "react";
import { cva, VariantProps } from "class-variance-authority";
import clsx from "clsx";

const label = cva(
  "block font-medium",
  {
    variants: {
      size: {
        sm: "text-xs",
        md: "text-sm",
        lg: "text-base",
      },
      variant: {
        default: "text-[color:var(--color-neutral-600)]",
        subtle: "text-[color:var(--color-neutral-400)]",
        accent: "text-[color:var(--color-accent-500)]",
      },
      uppercase: {
        true: "uppercase tracking-widest",
        false: "",
      },
    },
    defaultVariants: {
      size: "sm",
      variant: "default",
      uppercase: true,
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
  className,
  ...props
}: LabelProps) {
  return (
    <label className={clsx(label({ size, variant, uppercase }), className)} {...props}>
      {children}
    </label>
  );
}