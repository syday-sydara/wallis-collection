"use client";

import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import clsx from "clsx";

const spinnerStyles = cva(
  "rounded-full border-t-transparent border-solid",
  {
    variants: {
      size: {
        sm: "w-4 h-4 border-2",
        md: "w-6 h-6 border-2",
        lg: "w-8 h-8 border-4",
      },
      color: {
        white: "border-white border-t-transparent",
        primary: "border-[var(--color-primary-500)] border-t-transparent",
        accent: "border-[var(--color-accent-500)] border-t-transparent",
      },
      speed: {
        slow: "animate-spin-slow",
        normal: "animate-spin",
        fast: "animate-spin-fast",
        none: "",
      },
      overlay: {
        true: "fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50",
        false: "",
      },
    },
    defaultVariants: {
      size: "sm",
      color: "white",
      speed: "normal",
      overlay: false,
    },
  }
);

type CVAProps = VariantProps<typeof spinnerStyles>;

interface SpinnerProps extends CVAProps {
  className?: string;
  label?: string;
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(function Spinner(
  {
    size = "sm",
    color = "white",
    speed = "normal",
    overlay = false,
    className,
    label = "Loading",
    ...props
  },
  ref
) {
  const [motionSafeSpeed, setMotionSafeSpeed] = React.useState(speed);

  React.useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) {
      setMotionSafeSpeed("none");
    } else {
      setMotionSafeSpeed(speed);
    }
  }, [speed]);

  const isAnnounced = Boolean(label);

  return (
    <div
      ref={ref}
      className={clsx(
        spinnerStyles({
          size,
          color,
          speed: motionSafeSpeed,
          overlay,
        }),
        className
      )}
      role={isAnnounced ? "status" : undefined}
      aria-live={isAnnounced ? "polite" : undefined}
      aria-busy={isAnnounced ? "true" : undefined}
      aria-hidden={isAnnounced ? undefined : true}
      {...props}
    >
      {isAnnounced && <span className="sr-only">{label}</span>}
    </div>
  );
});

Spinner.displayName = "Spinner";

export default Spinner;