import * as React from "react";
import { cn } from "@/lib/cn";

type Variant = "basket" | "buy" | "outline";

export interface AddToCartButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: Variant;
  icon?: React.ReactNode;
}

export function AddToCartButton({
  className,
  children,
  loading = false,
  disabled,
  variant = "basket",
  icon,
  ...props
}: AddToCartButtonProps) {
  const isDisabled = disabled || loading;

  const styles = {
    basket: "bg-primary text-white hover:bg-primary/90",
    buy: "bg-green-600 text-white hover:bg-green-700",
    outline: "border border-border bg-bg hover:bg-bg-muted text-text",
  };

  return (
    <button
      className={cn(
        "flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
        styles[variant],
        isDisabled && "opacity-50 cursor-not-allowed",
        className
      )}
      disabled={isDisabled}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4 text-current" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
          />
        </svg>
      )}

      {icon}

      {children ??
        (variant === "buy" ? "Buy Now" : "Add to Basket")}
    </button>
  );
}
