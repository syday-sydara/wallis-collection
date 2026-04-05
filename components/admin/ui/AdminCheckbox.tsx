// components/admin/ui/AdminCheckbox.tsx
import { InputHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

interface AdminCheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

export function AdminCheckbox({
  className,
  label,
  size = "md",
  ...props
}: AdminCheckboxProps) {
  const checkbox = (
    <input
      type="checkbox"
      {...props}
      className={clsx(
        sizes[size],
        "rounded-[var(--radius-sm)] border-border text-primary",
        "focus:outline-none focus:ring-[var(--focus-ring-width)] focus:ring-[rgb(var(--focus-ring))]",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        "transition-all",
        className
      )}
    />
  );

  if (!label) return checkbox;

  return (
    <label className="flex items-center gap-2 cursor-pointer text-text text-sm">
      {checkbox}
      <span>{label}</span>
    </label>
  );
}