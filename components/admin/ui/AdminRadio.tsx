// components/admin/ui/AdminRadio.tsx
import { InputHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

interface AdminRadioProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode;
}

export function AdminRadio({ label, className, ...props }: AdminRadioProps) {
  const radio = (
    <input
      type="radio"
      {...props}
      className={clsx(
        "h-4 w-4 rounded-full border-border text-primary bg-surface-card",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        "transition-fast active:scale-press",
        className
      )}
    />
  );

  if (!label) return radio;

  return (
    <label className="flex items-center gap-2 text-sm text-text cursor-pointer">
      {radio}
      <span>{label}</span>
    </label>
  );
}
