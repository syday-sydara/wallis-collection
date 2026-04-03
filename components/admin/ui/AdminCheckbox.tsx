// components/admin/ui/AdminCheckbox.tsx
import { InputHTMLAttributes } from "react";
import clsx from "clsx";

export function AdminCheckbox({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="checkbox"
      {...props}
      className={clsx(
        "h-4 w-4 rounded border-border text-primary",
        "focus:outline-none focus:ring-[var(--focus-ring-width)] focus:ring-[rgb(var(--focus-ring))]",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        className
      )}
    />
  );
}