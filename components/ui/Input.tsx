"use client";

import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const inputStyles = cva(
  "w-full rounded-md border bg-surface text-text placeholder:text-text-subtle transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      size: { sm: "h-8 px-3 text-sm", md: "h-10 px-3 text-sm", lg: "h-12 px-4 text-base" },
      error: { true: "border-danger focus-visible:ring-danger", false: "border-border focus-visible:ring-primary" },
    },
    defaultVariants: { size: "md", error: false },
  }
);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputStyles> {
  label?: string;
  description?: string;
  errorMessage?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Input({
  label,
  description,
  errorMessage,
  leftIcon,
  rightIcon,
  size,
  error,
  className,
  id,
  ...props
}: InputProps) {
  const inputId = id ?? props.name;

  return (
    <div className="space-y-1.5">
      {label && <label htmlFor={inputId} className="block text-sm font-medium text-text">{label}</label>}
      <div className="relative">
        {leftIcon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle">{leftIcon}</span>}
        <input
          id={inputId}
          className={cn(inputStyles({ size, error }), leftIcon && "pl-10", rightIcon && "pr-10", className)}
          {...props}
        />
        {rightIcon && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-subtle">{rightIcon}</span>}
      </div>
      {description && !errorMessage && <p className="text-xs text-text-muted">{description}</p>}
      {errorMessage && <p className="text-xs text-danger">{errorMessage}</p>}
    </div>
  );
}