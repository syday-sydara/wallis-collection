"use client";

import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import clsx from "clsx";

const card = cva(
  "transition-shadow duration-200 bg-[var(--color-bg-surface)] transform",
  {
    variants: {
      shadow: {
        soft: "shadow-soft",
        card: "shadow-card",
        none: "",
      },
      size: {
        sm: "p-[var(--spacing-sm)]",
        md: "p-[var(--spacing-md)]",
        lg: "p-[var(--spacing-lg)]",
      },
      hoverEffect: {
        none: "",
        lift: "hover:shadow-card hover:-translate-y-1",
      },
      border: {
        none: "",
        subtle: "border border-[var(--color-border)]",
        strong: "border-2 border-[var(--color-border-strong)]",
      },
      rounded: {
        sm: "rounded-sm",
        md: "rounded-md",
        lg: "rounded-lg",
        xl: "rounded-xl",
      },
      clickable: {
        true: "cursor-pointer",
        false: "",
      },
    },
    defaultVariants: {
      shadow: "card",
      size: "md",
      hoverEffect: "lift",
      border: "none",
      rounded: "lg",
      clickable: false,
    },
  }
);

type CVAProps = VariantProps<typeof card>;

interface CardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, keyof CVAProps>,
    CVAProps {
  asChild?: boolean; // if true, caller renders a different element (e.g., <a> or <button>)
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(function Card(
  {
    children,
    shadow,
    size,
    hoverEffect,
    border,
    rounded,
    clickable = false,
    className,
    asChild = false,
    ...props
  },
  ref
) {
  const baseClass = card({ shadow, size, hoverEffect, border, rounded, clickable });
  const focusableProps = clickable
    ? {
        tabIndex: props.tabIndex ?? 0,
        role: props.role ?? "button",
        onKeyDown:
          props.onKeyDown ??
          ((e: React.KeyboardEvent) => {
            if (e.key === "Enter" || e.key === " ") {
              const target = e.currentTarget as HTMLElement;
              target.click();
              e.preventDefault();
            }
          }),
      }
    : {};

  // If asChild is used, we still render a div by default; consumers can implement a Slot pattern later.
  return (
    <div
      ref={ref}
      className={clsx(baseClass, className, clickable && "focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]")}
      {...focusableProps}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = "Card";

export default Card;
