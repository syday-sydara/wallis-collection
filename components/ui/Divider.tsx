"use client";

import React from "react";
import { cva, VariantProps } from "class-variance-authority";
import clsx from "clsx";

const divider = cva(
  "border-[var(--color-border)] transition-colors duration-200",
  {
    variants: {
      thickness: {
        thin: "border",
        thick: "border-2",
      },
      style: {
        solid: "border-solid",
        dashed: "border-dashed",
        dotted: "border-dotted",
      },
      margin: {
        sm: "my-[var(--spacing-sm)]",
        md: "my-[var(--spacing-md)]",
        lg: "my-[var(--spacing-lg)]",
      },
      hoverEffect: {
        none: "",
        accent: "hover:border-[var(--color-accent-500)]",
      },
    },
    defaultVariants: {
      thickness: "thin",
      style: "solid",
      margin: "md",
      hoverEffect: "accent",
    },
  }
);

interface DividerProps extends VariantProps<typeof divider> {}

export default function Divider({
  thickness,
  style,
  margin,
  hoverEffect,
}: DividerProps) {
  return <hr className={clsx(divider({ thickness, style, margin, hoverEffect }))} />;
}