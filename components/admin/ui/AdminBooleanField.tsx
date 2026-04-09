// components/admin/ui/AdminBooleanField.tsx
import { ReactNode } from "react";
import clsx from "clsx";
import { AdminToggle } from "./AdminToggle";

interface AdminBooleanFieldProps {
  label: string;
  checked: boolean;
  onChange: () => void;
  helper?: string;
  description?: ReactNode;
  className?: string;
  id?: string;
}

export function AdminBooleanField({
  label,
  checked,
  onChange,
  helper,
  description,
  className,
  id,
}: AdminBooleanFieldProps) {
  return (
    <div className={clsx("space-y-1.5", className)}>
      <label
        htmlFor={id}
        className="flex items-center justify-between text-sm text-text cursor-pointer"
      >
        <span>{label}</span>
        <AdminToggle checked={checked} onClick={onChange} id={id} />
      </label>

      {helper && (
        <p className="text-[11px] text-text-muted">{helper}</p>
      )}

      {description && (
        <div className="text-[11px] text-text-muted">{description}</div>
      )}
    </div>
  );
}
