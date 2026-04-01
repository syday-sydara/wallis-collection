"use client";

import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-colors active:scale-press focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-hover",
        outline: "border border-border text-text hover:bg-surface-muted",
        ghost: "bg-transparent text-text hover:bg-surface-muted",
        link: "bg-transparent underline-offset-4 text-primary hover:underline",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-base",
        lg: "h-12 px-6 text-lg",
      },
      full: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      full: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Button({
  className,
  variant,
  size,
  full,
  loading,
  leftIcon,
  rightIcon,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, full }), className)}
      disabled={loading || props.disabled}
      aria-busy={loading}
      {...props}
    >
      {/* Left Icon */}
      {leftIcon && !loading && (
        <span className="mr-2 flex items-center leading-none">{leftIcon}</span>
      )}

      {/* Loading Spinner */}
      {loading && (
        <Loader2
          className="mr-2 h-4 w-4 animate-spin leading-none animate-fadeIn-fast"
          aria-hidden="true"
        />
      )}

      {/* Button Text */}
      {children}

      {/* Right Icon */}
      {rightIcon && !loading && (
        <span className="ml-2 flex items-center leading-none">{rightIcon}</span>
      )}
    </button>
  );
}
