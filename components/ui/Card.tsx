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
  as?: keyof JSX.IntrinsicElements | React.ComponentType<any>;
}

const Card = React.forwardRef<HTMLElement, CardProps>(function Card(
  {
    children,
    shadow,
    size,
    hoverEffect,
    border,
    rounded,
    clickable = false,
    className,
    as: Comp = "div",
    ...props
  },
  ref
) {
  const baseClass = card({ shadow, size, hoverEffect, border, rounded, clickable });

  const focusableProps = clickable
    ? {
        tabIndex: props.tabIndex ?? 0,
        role: props.role ?? "button",
        onKeyDown: (e: React.KeyboardEvent) => {
          if (["A", "BUTTON"].includes((e.target as HTMLElement).tagName)) return;
          if (e.key === "Enter" || e.key === " ") {
            (e.currentTarget as HTMLElement).click();
            e.preventDefault();
          }
          props.onKeyDown?.(e);
        },
      }
    : {};

  return (
    <Comp
      ref={ref}
      className={clsx(
        baseClass,
        className,
        clickable && "focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
      )}
      data-shadow={shadow}
      data-size={size}
      data-hover={hoverEffect}
      data-clickable={clickable}
      {...focusableProps}
      {...props}
    >
      {children}
    </Comp>
  );
});

Card.displayName = "Card";

export default React.memo(Card);
