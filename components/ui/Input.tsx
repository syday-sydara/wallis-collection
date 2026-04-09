"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  size?: "sm" | "md" | "lg";
  error?: boolean;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, size = "md", error = false, ...props }, ref) => {
    const sizeClasses = {
      sm: "h-8 px-2 text-xs",
      md: "h-10 px-3 text-sm",
      lg: "h-12 px-4 text-base",
    };

    return (
      <input
        ref={ref}
        className={cn(
          "flex w-full rounded-md border bg-surface shadow-sm transition-all placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface",
          error ? "border-danger focus:ring-danger" : "border-border-subtle focus:ring-primary",
          sizeClasses[size],
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";