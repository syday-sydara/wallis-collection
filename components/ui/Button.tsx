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

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLElement>,
    ButtonVariants {
  loading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLElement, ButtonProps>(
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
      onKeyDown,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    const isDisabled = disabled || loading;

    return (
      <Comp
        ref={ref}
        className={clsx(buttonStyles({ variant, size, fullWidth, rounded }), className)}
        disabled={!asChild ? isDisabled : undefined}
        aria-busy={loading || undefined}
        data-variant={variant}
        data-size={size}
        data-loading={loading}
        tabIndex={asChild && !isDisabled ? 0 : undefined}
        role={asChild ? "button" : undefined}
        onKeyDown={(e) => {
          if (asChild && !isDisabled && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            props.onClick?.(e as any);
          }
          onKeyDown?.(e);
        }}
        {...props}
      >
        <span className="relative inline-flex items-center">
          {loading && (
            <span className="absolute inset-0 flex items-center justify-center">
              <Spinner size="sm" />
            </span>
          )}

          <span
            className={clsx("inline-flex items-center gap-2 transition-opacity", loading ? "opacity-0" : "opacity-100")}
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

export default React.memo(Button);
