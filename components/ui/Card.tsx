"use client";

import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

const cardVariants = cva(
  "rounded-lg border bg-surface text-text shadow-sm transition-colors cursor-default",
  {
    variants: {
      variant: {
        flat: "border-border shadow-none",
        elevated: "border-border shadow-md",
        subtle: "border-transparent bg-surface-muted shadow-none",
        interactive:
          "border-border shadow-sm hover:shadow-md active:scale-press cursor-pointer transition-all",
      },
      padding: {
        none: "p-0",
        sm: "p-3",
        md: "p-4",
        lg: "p-6",
      },
      full: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "flat",
      padding: "md",
      full: false,
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  loading?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export function Card({
  className,
  variant,
  padding,
  full,
  loading,
  header,
  footer,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        cardVariants({ variant, padding, full }),
        "animate-fadeIn",
        className
      )}
      {...props}
    >
      {/* Header */}
      {header && <div className="mb-3 font-semibold leading-snug">{header}</div>}

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-6 text-text-muted">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        children
      )}

      {/* Footer */}
      {footer && <div className="mt-3">{footer}</div>}
    </div>
  );
}
