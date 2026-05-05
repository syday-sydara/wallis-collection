import React from "react";
import clsx from "clsx";

const base =
  "inline-flex items-center justify-center font-medium transition-colors rounded-md focus:outline-none focus:ring-2 focus:ring-brand";

const variants = {
  primary: "bg-brand text-text-inverse hover:bg-brand-dark",
  secondary: "bg-bg-subtle text-text-primary border border-border hover:bg-bg-muted",
  outline: "border border-border text-text-primary hover:bg-bg-muted",
  danger: "bg-danger text-text-inverse hover:bg-red-700",
};

const sizes = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-base",
  lg: "h-12 px-6 text-lg",
};

type Variant = keyof typeof variants;
type Size = keyof typeof sizes;

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: {
  variant?: Variant;
  size?: Size;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={clsx(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}
