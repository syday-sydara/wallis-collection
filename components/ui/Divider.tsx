"use client";

import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import clsx from "clsx";

const divider = cva(
  "transition-colors duration-200",
  {
    variants: {
      orientation: {
        horizontal: "w-full border-t",
        vertical: "h-full border-l inline-block align-middle",
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
        high: "border-[var(--color-border-strong)]/90", // higher contrast option
        subtle: "border-[var(--color-border)]/50",
      },
    },
    defaultVariants: {
      orientation: "horizontal",
      thickness: "thin",
      style: "solid",
      margin: "md",
      hoverEffect: "accent",
      visible: "default",
    },
  }
);

type CVAProps = VariantProps<typeof divider>;

interface DividerProps
  extends Omit<React.HTMLAttributes<HTMLElement>, keyof CVAProps>,
    CVAProps {
  as?: "hr" | "div"; // choose semantic element; vertical recommended as div
}

/**
 * Accessible Divider supporting horizontal <hr> and vertical <div>.
 * - Use visible="high" for low-contrast themes.
 * - For vertical orientation, prefer as="div" to avoid invalid HTML.
 */
const Divider = React.forwardRef<HTMLElement, DividerProps>(function Divider(
  {
    orientation = "horizontal",
    thickness,
    style,
    margin,
    hoverEffect,
    visible = "default",
    className,
    as,
    role,
    ...props
  },
  ref
) {
  const element = as ?? (orientation === "vertical" ? "div" : "hr");
  const sharedClass = clsx(divider({ orientation, thickness, style, margin, hoverEffect, visible }), className);

  // Accessibility props
  const accessibilityProps: Record<string, any> =
    orientation === "vertical"
      ? {
          role: role ?? "separator",
          "aria-orientation": "vertical",
          "aria-hidden": props["aria-hidden"] ?? false,
        }
      : {
          role: role ?? undefined,
          "aria-hidden": props["aria-hidden"] ?? true,
        };

  if (element === "hr") {
    return (
      <hr
        ref={ref as React.LegacyRef<HTMLHRElement>}
        className={sharedClass}
        {...accessibilityProps}
        {...(props as React.HTMLAttributes<HTMLHRElement>)}
      />
    );
  }

  return (
    <div
      ref={ref as React.LegacyRef<HTMLDivElement>}
      className={sharedClass}
      {...accessibilityProps}
      {...(props as React.HTMLAttributes<HTMLDivElement>)}
    />
  );
});

Divider.displayName = "Divider";

export default Divider;
