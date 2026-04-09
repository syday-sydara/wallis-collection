"use client";

import { cn } from "@/lib/utils";

type Variant = "default" | "brand" | "warning" | "danger";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: Variant;
};

const variantClasses: Record<Variant, string> = {
  default: "bg-surface-muted text-text",
  brand: "bg-primary text-primary-foreground",
  warning: "bg-warning text-white",
  danger: "bg-danger text-white",
};

export function Badge({ variant = "default", className, ...props }: BadgeProps) {
  return (
    <span
      role="status" // improves accessibility for badges conveying information
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium leading-none select-none",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}