// components/admin/ui/AdminField.tsx
import { ReactNode } from "react";

export function AdminField({
  label,
  error,
  helper,
  children
}: {
  label?: string;
  error?: string;
  helper?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-xs font-medium text-text-muted">
          {label}
        </label>
      )}

      {children}

      {error && (
        <p className="text-[11px] text-danger-foreground">{error}</p>
      )}

      {helper && !error && (
        <p className="text-[11px] text-text-muted">{helper}</p>
      )}
    </div>
  );
}