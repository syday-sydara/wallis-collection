"use client";

import React from "react";
import { cva, VariantProps } from "class-variance-authority";
import clsx from "clsx";
import Spinner from "@/components/ui/Spinner";

const button = cva(
  "inline-flex items-center justify-center font-medium transition duration-normal ease-smooth disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--color-primary-500)] text-white hover:opacity-90",
        outline:
          "border border-[var(--color-primary-500)] text-[var(--color-primary-500)] hover:bg-[var(--color-primary-500)]/10",
        subtle:
          "text-[var(--color-text-secondary)] hover:text-[var(--color-primary-500)]",
      },
      size: {
        sm: "px-3 py-1 text-xs rounded-md",
        md: "px-6 py-2 text-sm rounded-md",
        lg: "px-8 py-3 text-base rounded-lg",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
      rounded: {
        sm: "rounded-sm",
        md: "rounded-md",
        lg: "rounded-lg",
        full: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      fullWidth: false,
      rounded: "md",
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button> {
  loading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export default function Button({
  children,
  variant,
  size,
  fullWidth,
  rounded,
  loading = false,
  iconLeft,
  iconRight,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(button({ variant, size, fullWidth, rounded }), className)}
      disabled={disabled || loading}
      aria-busy={loading}
      aria-live="polite"
      {...props}
    >
      {loading ? (
        <Spinner size="sm" color={variant === "primary" ? "white" : "primary"} />
      ) : (
        <>
          {iconLeft && <span className="mr-2">{iconLeft}</span>}
          {children}
          {iconRight && <span className="ml-2">{iconRight}</span>}
        </>
      )}
    </button>
  );
}
