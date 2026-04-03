"use client";

import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

type Variant = keyof typeof variantClasses;
type Size = keyof typeof sizeClasses;

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
};

const variantClasses = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active",
  outline:
    "border border-border-subtle bg-surface text-text hover:bg-surface-muted",
  ghost: "bg-transparent text-text hover:bg-surface-muted",
};

const sizeClasses = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-5 text-base",
};

export function Button({
  asChild,
  variant = "primary",
  size = "md",
  fullWidth,
  className,
  type,
  disabled,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      type={type ?? "button"} // prevent accidental form submits
      aria-disabled={disabled}
      data-variant={variant}
      data-size={size}
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-all",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface",
        "disabled:opacity-50 disabled:cursor-not-allowed active:scale-press",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && "w-full",
        className
      )}
      disabled={disabled}
      {...props}
    />
  );
}