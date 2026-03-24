"use client";

import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import clsx from "clsx";
import Spinner from "@/components/ui/Spinner";
import { Slot } from "@radix-ui/react-slot";

const buttonStyles = cva(
  "inline-flex items-center justify-center font-medium transition-all duration-200 ease-out disabled:opacity-50 disabled:pointer-events-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--color-primary-500)] text-white hover:bg-[var(--color-primary-500)]/90",
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

type ButtonVariants = VariantProps<typeof buttonStyles>;

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonVariants {
  loading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
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
      asChild = false,
      "aria-label": ariaLabel,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    const isPrimary = variant === "primary";

    return (
      <Comp
        ref={ref}
        className={clsx(buttonStyles({ variant, size, fullWidth, rounded }), className)}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        aria-disabled={disabled || loading || undefined}
        aria-label={ariaLabel}
        {...props}
      >
        <span className="relative inline-flex items-center">
          {loading && (
            <span className="absolute inset-0 flex items-center justify-center">
              <Spinner size="sm" color={isPrimary ? "white" : "primary"} />
            </span>
          )}

          <span
            className={clsx(
              "inline-flex items-center gap-2 transition-opacity",
              loading ? "opacity-0" : "opacity-100"
            )}
            aria-hidden={loading}
          >
            {iconLeft}
            {children}
            {iconRight}
          </span>

          {loading && <span className="sr-only">Loading…</span>}
        </span>
      </Comp>
    );
  }
);

Button.displayName = "Button";

export default Button;