// components/admin/ui/AdminToggle.tsx
import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

interface AdminToggleProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  checked: boolean;
}

export function AdminToggle({
  checked,
  className,
  ...props
}: AdminToggleProps) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      {...props}
      className={clsx(
        "inline-flex h-6 w-11 items-center rounded-full border transition-fast active:scale-press",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1",

        checked
          ? "border-primary bg-primary"
          : "border-border bg-surface-muted",

        "disabled:opacity-60 disabled:cursor-not-allowed",
        className
      )}
    >
      <span
        className={clsx(
          "h-4 w-4 rounded-full bg-surface-card shadow-sm transition-fast",
          checked ? "translate-x-5" : "translate-x-1"
        )}
      />
    </button>
  );
}
