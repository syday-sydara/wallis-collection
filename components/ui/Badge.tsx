"use client";

import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import clsx from "clsx";

const badge = cva(
  "inline-flex items-center font-medium transition-colors duration-200",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--color-border)]/20 text-[var(--color-text-secondary)]",
        success:
          "bg-[var(--color-success-500)]/10 text-[var(--color-success-500)]",
        warning:
          "bg-[var(--color-warning-500)]/10 text-[var(--color-warning-500)]",
        danger:
          "bg-[var(--color-danger-500)]/10 text-[var(--color-danger-500)]",
      },
      size: {
        sm: "text-xs px-2 py-0.5",
        md: "text-sm px-3 py-1",
        lg: "text-base px-4 py-1.5",
      },
      rounded: {
        sm: "rounded-sm",
        md: "rounded-md",
        lg: "rounded-lg",
        full: "rounded-full",
      },
      uppercase: {
        true: "uppercase tracking-wide",
        false: "",
      },
      interactive: {
        true: "cursor-pointer hover:opacity-80",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "sm",
      rounded: "full",
      uppercase: false,
      interactive: false,
    },
  }
);

type CVAProps = VariantProps<typeof badge>;

interface BadgeProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, keyof CVAProps>,
    CVAProps {
  asChild?: boolean; // optional: allow slotting another element via Slot pattern
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  {
    children,
    variant,
    size,
    rounded,
    uppercase = false,
    interactive = false,
    className,
    asChild = false,
    ...props
  },
  ref
) {
  // If interactive, suggest role button by default (can be overridden)
  const role = interactive ? (props.role ?? "button") : props.role;

  return (
    <span
      ref={ref}
      role={role}
      aria-pressed={interactive ? props["aria-pressed"] ?? undefined : undefined}
      className={clsx(
        badge({ variant, size, rounded, uppercase: String(uppercase) as any, interactive: String(interactive) as any }),
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
});

Badge.displayName = "Badge";

export default Badge;
