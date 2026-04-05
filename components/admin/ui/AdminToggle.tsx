import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

interface AdminToggleProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  checked: boolean;
}

export function AdminToggle({ checked, className, ...props }: AdminToggleProps) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      {...props}
      className={clsx(
        "inline-flex h-6 w-11 items-center rounded-full border transition-all",
        "focus:outline-none focus:ring-[var(--focus-ring-width)] focus:ring-[rgb(var(--focus-ring))]",
        checked
          ? "border-primary bg-primary"
          : "border-border bg-surface-muted",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        className
      )}
    >
      <span
        className={clsx(
          "h-4 w-4 rounded-full bg-surface-card shadow-sm transition-transform",
          checked ? "translate-x-5" : "translate-x-1"
        )}
      />
    </button>
  );
}