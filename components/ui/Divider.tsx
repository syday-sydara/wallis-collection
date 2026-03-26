"use client";

import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import clsx from "clsx";

const divider = cva("transition-colors duration-200", {
  variants: {
    orientation: {
      horizontal: "w-full border-t",
      vertical: "border-l inline-block align-middle",
    },
    thickness: {
      thin: "border-[1px]",
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
    visible: {
      default: "border-[var(--color-border)]",
      high: "border-[var(--color-border-strong)]/90",
      subtle: "border-[var(--color-border)]/50",
    },
  },
  defaultVariants: {
    orientation: "horizontal",
    thickness: "thin",
    style: "solid",
    margin: "md",
    hoverEffect: "none",
    visible: "default",
  },
});

type DividerVariants = VariantProps<typeof divider>;

interface DividerProps
  extends Omit<React.HTMLAttributes<HTMLElement>, keyof DividerVariants>,
    DividerVariants {
  as?: keyof JSX.IntrinsicElements;
}

const Divider = React.forwardRef<HTMLElement, DividerProps>(
  (
    {
      orientation = "horizontal",
      thickness,
      style,
      margin,
      hoverEffect,
      visible,
      className,
      as,
      role,
      ...props
    },
    ref
  ) => {
    const Element = as ?? (orientation === "vertical" ? "div" : "hr");

    const classes = clsx(
      divider({ orientation, thickness, style, margin, hoverEffect, visible }),
      className
    );

    const accessibilityProps =
      orientation === "vertical"
        ? {
            role: role ?? "separator",
            "aria-orientation": "vertical",
            "aria-hidden": props["aria-hidden"] ?? true,
          }
        : {
            role: role ?? undefined,
            "aria-hidden": props["aria-hidden"] ?? true,
          };

    return (
      <Element
        ref={ref as any}
        className={classes}
        {...accessibilityProps}
        {...props}
      />
    );
  }
);

Divider.displayName = "Divider";

export default Divider;
