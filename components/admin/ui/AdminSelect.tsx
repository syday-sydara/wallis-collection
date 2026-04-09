// components/admin/ui/AdminSelect.tsx
import { SelectHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

interface AdminSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  selectSize?: "sm" | "md" | "lg";
  invalid?: boolean;
}

const sizes = {
  sm: "h-7 text-xs px-2",
  md: "h-9 text-sm px-2.5",
  lg: "h-11 text-base px-3",
};

export function AdminSelect({
  className,
  leftIcon,
  rightIcon,
  selectSize = "md",
  invalid = false,
  children,
  ...props
}: AdminSelectProps) {
  return (
    <div className="relative w-full">
      {leftIcon && (
        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
          {leftIcon}
        </span>
      )}

      <select
        {...props}
        className={clsx(
          "w-full rounded-md border bg-surface-card shadow-sm appearance-none",
          "transition-fast active:scale-press",
          sizes[selectSize],
          leftIcon && "pl-8",
          rightIcon && "pr-8",

          invalid
            ? "border-danger text-danger placeholder-danger/60"
            : "border-border text-text placeholder-text-muted",

          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1",
          "disabled:opacity-60 disabled:cursor-not-allowed",

          className
        )}
      >
        {children}
      </select>

      {rightIcon && (
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
          {rightIcon}
        </span>
      )}
    </div>
  );
}
