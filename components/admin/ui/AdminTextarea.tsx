// components/admin/ui/AdminTextarea.tsx
import { TextareaHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

interface AdminTextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  size?: "sm" | "md" | "lg";
  invalid?: boolean;
}

const sizes = {
  sm: "text-xs px-2 py-1.5",
  md: "text-sm px-2.5 py-2",
  lg: "text-base px-3 py-2.5",
};

export function AdminTextarea({
  className,
  rows = 4,
  leftIcon,
  rightIcon,
  size = "md",
  invalid = false,
  ...props
}: AdminTextareaProps) {
  return (
    <div className="relative w-full">
      {leftIcon && (
        <span className="absolute left-2 top-3 text-text-muted pointer-events-none">
          {leftIcon}
        </span>
      )}

      <textarea
        rows={rows}
        {...props}
        className={clsx(
          "w-full rounded-md border bg-surface-card shadow-sm transition-all resize-none",
          sizes[size],
          leftIcon && "pl-8",
          rightIcon && "pr-8",

          invalid
            ? "border-danger text-danger"
            : "border-border text-text",

          "focus:outline-none focus:ring-[var(--focus-ring-width)] focus:ring-[rgb(var(--focus-ring))] focus:ring-offset-1",

          "disabled:opacity-60 disabled:cursor-not-allowed",

          className
        )}
      />

      {rightIcon && (
        <span className="absolute right-2 top-3 text-text-muted pointer-events-none">
          {rightIcon}
        </span>
      )}
    </div>
  );
}