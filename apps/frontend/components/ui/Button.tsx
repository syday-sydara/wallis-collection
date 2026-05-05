import * as React from "react";
import { cn } from "@/lib/cn";

const buttonVariants = {
  primary:
    "bg-brand text-text-inverse hover:bg-brand-dark focus:ring-brand",
  secondary:
    "bg-bg-subtle text-text-primary border border-border hover:bg-bg-muted",
  outline:
    "border border-border text-text-primary hover:bg-bg-muted",
  subtle:
    "bg-bg-muted text-text-primary hover:bg-bg-subtle",
  ghost:
    "text-text-primary hover:bg-bg-muted",
  destructive:
    "bg-danger text-text-inverse hover:bg-red-700 focus:ring-danger",
};

const buttonSizes = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-base",
  lg: "h-12 px-6 text-lg",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof buttonSizes;
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", isLoading, className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={isLoading || props.disabled}
        className={cn(
          "inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 disabled:opacity-50 disabled:pointer-events-none",
          buttonVariants[variant],
          buttonSizes[size],
          className
        )}
        {...props}
      >
        {isLoading && (
          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent border-text-inverse" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
