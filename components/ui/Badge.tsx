"use client";

import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import clsx from "clsx";

const badgeStyles = cva(
  "inline-flex items-center font-medium transition-colors duration-200 select-none",
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
        true: "cursor-pointer hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]",
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

type BadgeVariants = VariantProps<typeof badgeStyles>;

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    BadgeVariants {
  asChild?: boolean;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      children,
      variant,
      size,
      rounded,
      uppercase,
      interactive,
      className,
      asChild = false,
      role,
      tabIndex,
      ...props
    },
    ref
  ) => {
    const isInteractive = Boolean(interactive);

    return (
      <span
        ref={ref}
        role={isInteractive ? role ?? "button" : role}
        tabIndex={isInteractive ? tabIndex ?? 0 : tabIndex}
        className={clsx(
          badgeStyles({ variant, size, rounded, uppercase, interactive }),
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";

export default Badge;