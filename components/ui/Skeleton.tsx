"use client";

import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import clsx from "clsx";

const skeletonStyles = cva(
  "bg-[var(--shimmer-from)] motion-reduce:animate-none transition-colors duration-200",
  {
    variants: {
      shape: {
        block: "rounded-md",
        circle: "rounded-full",
        text: "h-4 rounded-sm",
      },
      size: {
        sm: "h-4 w-16",
        md: "h-6 w-32",
        lg: "h-8 w-64",
        fluid: "w-full h-6",
      },
      animation: {
        shimmer: "animate-shimmer",
        pulse: "animate-pulse",
        none: "",
      },
      margin: {
        none: "",
        sm: "my-1",
        md: "my-2",
        lg: "my-3",
      },
    },
    defaultVariants: {
      shape: "block",
      size: "fluid",
      animation: "shimmer",
      margin: "none",
    },
  }
);

type SkeletonVariants = VariantProps<typeof skeletonStyles>;

interface SkeletonProps extends SkeletonVariants {
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  ariaLabel?: string;
}

const Skeleton = React.forwardRef<HTMLElement, SkeletonProps>(
  (
    {
      shape,
      size,
      animation,
      margin,
      className,
      as,
      ariaLabel,
      ...props
    },
    ref
  ) => {
    const Element = as ?? (shape === "text" ? "span" : "div");
    const isAnnounced = Boolean(ariaLabel);

    return (
      <Element
        ref={ref}
        role={isAnnounced ? "status" : undefined}
        aria-live={isAnnounced ? "polite" : undefined}
        aria-label={ariaLabel}
        aria-hidden={isAnnounced ? undefined : true}
        className={clsx(
          skeletonStyles({ shape, size, animation, margin }),
          className
        )}
        {...props}
      />
    );
  }
);

Skeleton.displayName = "Skeleton";

export default Skeleton;