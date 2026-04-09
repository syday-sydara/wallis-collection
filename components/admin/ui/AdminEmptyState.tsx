// components/admin/ui/AdminEmptyState.tsx
import { ReactNode } from "react";
import clsx from "clsx";

interface AdminEmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function AdminEmptyState({
  icon,
  title,
  description,
  action,
  className,
}: AdminEmptyStateProps) {
  return (
    <div
      role="status"
      className={clsx(
        "flex flex-col items-center justify-center text-center py-10 px-4",
        "space-y-3 transition-fast",
        className
      )}
    >
      {icon && (
        <div
          aria-hidden="true"
          className="text-text-muted text-3xl animate-fade-in"
        >
          {icon}
        </div>
      )}

      <h3 className="text-base font-semibold text-text tracking-tight">
        {title}
      </h3>

      {description && (
        <p className="text-sm text-text-muted max-w-sm">
          {description}
        </p>
      )}

      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}