// components/admin/ui/AdminInput.tsx
import { InputHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

interface AdminInputProps extends InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  size?: "sm" | "md" | "lg";
  invalid?: boolean;
}

const sizes = {
  sm: "h-7 text-xs px-2",
  md: "h-9 text-sm px-2.5",
  lg: "h-11 text-base px-3",
};

export function AdminInput({
  className,
  type = "text",
  leftIcon,
  rightIcon,
  size = "md",
  invalid = false,
  ...props
}: AdminInputProps) {
  return (
    <div className="relative w-full">
      {leftIcon && (
        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
          {leftIcon}
        </span>
      )}

      <input
        type={type}
        {...props}
        className={clsx(
          "w-full rounded-md border bg-surface-card shadow-sm transition-all",
          sizes[size],
          leftIcon && "pl-8",
          rightIcon && "pr-8",

          // Border + text colors
          invalid
            ? "border-danger text-danger"
            : "border-border text-text",

          // Focus ring
          "focus:outline-none focus:ring-[var(--focus-ring-width)] focus:ring-[rgb(var(--focus-ring))] focus:ring-offset-1",

          // Disabled
          "disabled:opacity-60 disabled:cursor-not-allowed",

          className
        )}
      />

      {rightIcon && (
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
          {rightIcon}
        </span>
      )}
    </div>
  );
}