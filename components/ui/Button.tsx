"use client";

import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import clsx from "clsx";
import Spinner from "@/components/ui/Spinner";
import { Slot } from "@radix-ui/react-slot";

const button = cva(
  "inline-flex items-center justify-center font-medium transition duration-normal ease-smooth disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary: "bg-[var(--color-primary-500)] text-white hover:opacity-90",
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

type CVAProps = VariantProps<typeof button>;

interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof CVAProps>,
    CVAProps {
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
      fullWidth = false,
      rounded = "md",
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
    const isPrimary = variant === "primary";
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        className={clsx(button({ variant, size, fullWidth, rounded }), className)}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        aria-label={ariaLabel}
        {...props}
      >
        <span className="relative inline-flex items-center">
          {loading && (
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <Spinner size="sm" color={isPrimary ? "white" : "primary"} />
            </span>
          )}

          <span
            className={clsx(
              "inline-flex items-center transition-opacity",
              loading ? "opacity-0" : "opacity-100"
            )}
            aria-hidden={loading}
          >
            {iconLeft && <span className="mr-2 flex items-center">{iconLeft}</span>}
            {children}
            {iconRight && <span className="ml-2 flex items-center">{iconRight}</span>}
          </span>

          {loading && <span className="sr-only">Loading…</span>}
        </span>
      </Comp>
    );
  }
);

Button.displayName = "Button";

export default Button;