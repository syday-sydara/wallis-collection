"use client";

import React from "react";
import { cva, VariantProps } from "class-variance-authority";
import clsx from "clsx";

const card = cva(
  "rounded-lg shadow-card p-4 bg-[color:var(--color-surface)] transition-shadow duration-200",
  {
    variants: {
      shadow: {
        soft: "shadow-soft",
        card: "shadow-card",
        none: "",
      },
      size: {
        sm: "p-2",
        md: "p-4",
        lg: "p-6",
      },
    },
    defaultVariants: {
      shadow: "card",
      size: "md",
    },
  }
);

interface CardProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof card> {}

export default function Card({ children, shadow, size, className, ...props }: CardProps) {
  return <div className={clsx(card({ shadow, size }), className)} {...props}>{children}</div>;
}