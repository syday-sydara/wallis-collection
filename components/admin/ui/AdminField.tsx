// components/admin/ui/AdminField.tsx
import { ReactNode } from "react";
import clsx from "clsx";

interface AdminFieldProps {
  label?: string;
  error?: string;
  helper?: string;
  description?: ReactNode;
  id?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

export function AdminField({
  label,
  error,
  helper,
  description,
  id,
  required = false,
  className,
  children,
}: AdminFieldProps) {
  return (
    <div className={clsx("space-y-1.5", className)}>
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-medium text-text-muted"
        >
          {label}
          {required && <span className="text-danger ml-0.5">*</span>}
        </label>
      )}

      {children}

      {error && (
        <p className="text-[11px] text-danger font-medium">{error}</p>
      )}

      {!error && helper && (
        <p className="text-[11px] text-text-muted">{helper}</p>
      )}

      {description && (
        <div className="text-[11px] text-text-muted">{description}</div>
      )}
    </div>
  );
}