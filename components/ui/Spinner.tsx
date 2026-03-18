"use client";

import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import clsx from "clsx";

const spinnerStyles = cva(
  "rounded-full border-solid border-t-transparent motion-reduce:animate-none",
  {
    variants: {
      size: {
        sm: "w-4 h-4 border-2",
        md: "w-6 h-6 border-2",
        lg: "w-8 h-8 border-4",
      },
      color: {
        white: "border-white",
        primary: "border-[var(--color-primary-500)]",
        accent: "border-[var(--color-accent-500)]",
      },
      speed: {
        slow: "animate-spin-slow",
        normal: "animate-spin",
        fast: "animate-spin-fast",
        static: "",
      },
    },
    defaultVariants: {
      size: "sm",
      color: "white",
      speed: "normal",
    },
  }
);

type SpinnerVariants = VariantProps<typeof spinnerStyles>;

interface SpinnerProps extends SpinnerVariants {
  className?: string;
  label?: string;
  overlay?: boolean;
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  (
    {
      size,
      color,
      speed,
      overlay = false,
      className,
      label = "Loading",
      ...props
    },
    ref
  ) => {
    const spinner = (
      <div
        ref={ref}
        className={clsx(spinnerStyles({ size, color, speed }), className)}
        role={label ? "status" : undefined}
        aria-live={label ? "polite" : undefined}
        aria-busy={label ? "true" : undefined}
        aria-hidden={label ? undefined : true}
        {...props}
      >
        {label && <span className="sr-only">{label}</span>}
      </div>
    );

    if (!overlay) return spinner;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
        {spinner}
      </div>
    );
  }
);

Spinner.displayName = "Spinner";

export default Spinner;