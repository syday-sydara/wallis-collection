"use client";

import React from "react";
import { cva, VariantProps } from "class-variance-authority";
import clsx from "clsx";

const spinner = cva(
  "rounded-full border-t-transparent border-solid animate-spin",
  {
    variants: {
      size: {
        sm: "w-4 h-4 border-2",
        md: "w-6 h-6 border-2",
        lg: "w-8 h-8 border-4",
      },
      color: {
        white: "border-white border-t-transparent",
        primary: "border-[var(--color-primary-500)] border-t-transparent",
        accent: "border-[var(--color-accent-500)] border-t-transparent",
      },
      speed: {
        slow: "animate-spin-slow",
        normal: "animate-spin",
        fast: "animate-spin-fast",
      },
      overlay: {
        true: "fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50",
        false: "",
      },
    },
    defaultVariants: {
      size: "sm",
      color: "white",
      speed: "normal",
      overlay: false,
    },
  }
);

interface SpinnerProps extends VariantProps<typeof spinner> {
  className?: string;
}

export default function Spinner({
  size,
  color,
  speed,
  overlay,
  className,
}: SpinnerProps) {
  return (
    <div
      className={clsx(spinner({ size, color, speed, overlay }), className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Loading</span>
    </div>
  );
}
