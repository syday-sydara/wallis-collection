"use client";

import React from "react";
import { cva, VariantProps } from "class-variance-authority";
import clsx from "clsx";

const spinner = cva("animate-spin rounded-full border-t-transparent border-solid", {
  variants: {
    size: {
      sm: "w-4 h-4 border-2",
      md: "w-6 h-6 border-2",
      lg: "w-8 h-8 border-4",
    },
    color: {
      white: "border-white border-t-transparent",
      primary: "border-[color:var(--color-primary-500)] border-t-transparent",
      accent: "border-[color:var(--color-accent-500)] border-t-transparent",
    },
  },
  defaultVariants: {
    size: "sm",
    color: "white",
  },
});

interface SpinnerProps extends VariantProps<typeof spinner> {
  className?: string;
}

export default function Spinner({ size, color, className }: SpinnerProps) {
  return <div className={clsx(spinner({ size, color }), className)} />;
}