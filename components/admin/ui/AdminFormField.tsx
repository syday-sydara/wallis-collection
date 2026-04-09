// components/admin/ui/AdminFormField.tsx
import { ReactNode } from "react";
import clsx from "clsx";

interface AdminFormFieldProps {
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
}

export function AdminFormField({
  label,
  description,
  error,
  required,
  disabled,
  children,
  className,
}: AdminFormFieldProps) {
  return (
    <div className={clsx("space-y-1.5", className)}>
      {label && (
        <label
          className={clsx(
            "text-sm font-medium text-text flex items-center gap-1",
            disabled && "opacity-60"
          )}
        >
          {label}
          {required && <span className="text-danger">*</span>}
        </label>
      )}

      {description && (
        <p className="text-xs text-text-muted">{description}</p>
      )}

      <div className={clsx(disabled && "opacity-60")}>{children}</div>

      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

