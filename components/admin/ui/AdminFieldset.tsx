// components/admin/ui/AdminFieldset.tsx
import { ReactNode } from "react";
import clsx from "clsx";

interface AdminFieldsetProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  id?: string;
}

export function AdminFieldset({
  title,
  description,
  children,
  className,
  id,
}: AdminFieldsetProps) {
  return (
    <fieldset
      id={id}
      className={clsx(
        "rounded-md border border-border bg-surface-card p-4 space-y-3 transition-fast",
        className
      )}
    >
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <legend className="text-sm font-semibold text-text tracking-tight">
              {title}
            </legend>
          )}

          {description && (
            <p className="text-xs text-text-muted">{description}</p>
          )}
        </div>
      )}

      <div className="space-y-3">{children}</div>
    </fieldset>
  );
}
