"use client";

import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import clsx from "clsx";
import Spinner from "@/components/ui/Spinner";

const buttonStyles = cva(
  "inline-flex items-center justify-center font-medium transition-all duration-200 ease-out disabled:opacity-50 disabled:pointer-events-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]",
  {
    variants: {
      variant: {
        primary: "bg-[var(--color-primary-500)] text-white hover:bg-[var(--color-primary-500)]/90",
        outline: "border border-[var(--color-primary-500)] text-[var(--color-primary-500)] hover:bg-[var(--color-primary-500)]/10",
        subtle: "text-[var(--color-text-secondary)] hover:text-[var(--color-primary-500)]",
      },
      size: {
        sm: "px-3 py-2 text-xs rounded-md min-h-[40px]",
        md: "px-6 py-3 text-sm rounded-md min-h-[44px]",
        lg: "px-8 py-4 text-base rounded-lg min-h-[48px]",
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

type ButtonVariants = VariantProps<typeof buttonStyles>;

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, ButtonVariants {
  loading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant, size, fullWidth, rounded, loading = false, iconLeft, iconRight, className, disabled, ...props }, ref) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        className={clsx(buttonStyles({ variant, size, fullWidth, rounded }), className)}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        data-variant={variant}
        data-size={size}
        data-loading={loading}
        {...props}
      >
        <span className="relative inline-flex items-center">
          {loading && (
            <span className="absolute inset-0 flex items-center justify-center">
              <Spinner size="sm" />
            </span>
          )}

          <span className={clsx("inline-flex items-center gap-2 transition-opacity", loading ? "opacity-0" : "opacity-100")} aria-hidden={loading}>
            {iconLeft}
            {children}
            {iconRight}
          </span>

          {loading && <span className="sr-only">Loading…</span>}
        </span>
      </button>
    );
  }
);

Button.displayName = "Button";

export default React.memo(Button);