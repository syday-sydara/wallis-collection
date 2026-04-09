// components/admin/ui/AdminCheckbox.tsx
import { InputHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

interface AdminCheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode;
  checkboxSize?: "sm" | "md" | "lg";
}

const sizes = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

export function AdminCheckbox({
  className,
  label,
  checkboxSize = "md",
  ...props
}: AdminCheckboxProps) {
  const checkbox = (
    <input
      type="checkbox"
      {...props}
      className={clsx(
        sizes[checkboxSize],
        "rounded-[var(--radius-sm)] border-border bg-surface-card text-primary",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        "transition-fast active:scale-press",
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
