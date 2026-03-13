"use client";

import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import clsx from "clsx";

const skeletonStyles = cva(
  "bg-[var(--color-neutral-100)] transition-colors duration-200",
  {
    variants: {
      shape: {
        block: "rounded-[var(--radius-sm)]",
        circle: "rounded-full",
        text: "h-4 rounded-sm",
      },
      size: {
        sm: "h-4 w-16",
        md: "h-6 w-32",
        lg: "h-8 w-64",
        full: "w-full h-6",
      },
      animation: {
        shimmer: "animate-shimmer",
        pulse: "animate-pulse",
        none: "",
      },
      margin: {
        none: "",
        sm: "my-[var(--spacing-sm)]",
        md: "my-[var(--spacing-md)]",
        lg: "my-[var(--spacing-lg)]",
      },
    },
    defaultVariants: {
      shape: "block",
      size: "full",
      animation: "shimmer",
      margin: "none",
    },
  }
);

type CVAProps = VariantProps<typeof skeletonStyles>;

interface SkeletonProps extends CVAProps {
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  ariaLabel?: string;
}

const Skeleton = React.forwardRef<HTMLElement, SkeletonProps>(function Skeleton(
  {
    shape = "block",
    size = "full",
    animation = "shimmer",
    margin = "none",
    className,
    as,
    ariaLabel,
    ...props
  },
  ref
) {
  const Element = as ?? (shape === "text" ? "span" : "div");

  const [motionSafeAnimation, setMotionSafeAnimation] = React.useState<
    SkeletonProps["animation"]
  >(animation);

  React.useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) {
      setMotionSafeAnimation("none");
    } else {
      setMotionSafeAnimation(animation);
    }
  }, [animation]);

  const isAnnounced = Boolean(ariaLabel);

  return (
    <Element
      ref={ref}
      role={isAnnounced ? "status" : undefined}
      aria-live={isAnnounced ? "polite" : undefined}
      aria-label={ariaLabel}
      aria-hidden={isAnnounced ? undefined : true}
      className={clsx(
        skeletonStyles({
          shape,
          size,
          animation: motionSafeAnimation,
          margin,
        }),
        className
      )}
      {...props}
    />
  );
});

Skeleton.displayName = "Skeleton";

export default Skeleton;