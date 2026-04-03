// components/admin/ui/AdminField.tsx
import { ReactNode } from "react";
import clsx from "clsx";

export function AdminField({
  label,
  error,
  helper,
  id,
  className,
  children
}: {
  label?: string;
  error?: string;
  helper?: string;
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={clsx("space-y-1", className)}>
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-medium text-text-muted"
        >
          {label}
        </label>
      )}

      {children}

      {error && (
        <p className="text-[11px] text-danger-foreground">{error}</p>
      )}

      {!error && helper && (
        <p className="text-[11px] text-text-muted">{helper}</p>
      )}
    </div>
  );
}