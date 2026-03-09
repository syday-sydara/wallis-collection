"use client";

import React from "react";
import { cva, VariantProps } from "class-variance-authority";
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

interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof card> {}

export default function Card({
  children,
  shadow,
  size,
  hoverEffect,
  border,
  rounded,
  clickable,
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={clsx(
        card({ shadow, size, hoverEffect, border, rounded, clickable }),
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
