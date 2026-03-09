"use client";

import React from "react";
import { cva, VariantProps } from "class-variance-authority";
import clsx from "clsx";

const divider = cva(
  "border-[var(--color-border)] transition-colors duration-200",
  {
    variants: {
      orientation: {
        horizontal: "w-full border-t",
        vertical: "h-full border-l",
      },
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
      orientation: "horizontal",
      thickness: "thin",
      style: "solid",
      margin: "md",
      hoverEffect: "accent",
    },
  }
);

interface DividerProps
  extends VariantProps<typeof divider>,
    React.HTMLAttributes<HTMLHRElement> {}

export default function Divider({
  orientation,
  thickness,
  style,
  margin,
  hoverEffect,
  className,
  ...props
}: DividerProps) {
  return (
    <hr
      aria-hidden="true"
      className={clsx(
        divider({ orientation, thickness, style, margin, hoverEffect }),
        className
      )}
      {...props}
    />
  );
}
