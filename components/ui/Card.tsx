"use client";

import React from "react";
import { cva, VariantProps } from "class-variance-authority";
import clsx from "clsx";

const card = cva(
  "rounded-lg transition-shadow duration-200 bg-[var(--color-bg-surface)] transform",
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
    },
    defaultVariants: {
      shadow: "card",
      size: "md",
      hoverEffect: "lift",
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
  className,
  ...props
}: CardProps) {
  return (
    <div className={clsx(card({ shadow, size, hoverEffect }), className)} {...props}>
      {children}
    </div>
  );
}