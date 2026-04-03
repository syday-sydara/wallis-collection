// components/admin/ui/AdminTextarea.tsx
import { TextareaHTMLAttributes } from "react";
import clsx from "clsx";

export function AdminTextarea({
  className,
  rows = 4,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      rows={rows}
      {...props}
      className={clsx(
        "w-full rounded-md border border-border bg-surface px-2 py-1.5 text-text shadow-sm",
        "focus:outline-none focus:ring-[var(--focus-ring-width)] focus:ring-[rgb(var(--focus-ring))] focus:ring-offset-1",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        className
      )}
    />
  );
}