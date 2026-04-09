// components/admin/ui/AdminPageHeader.tsx
import { ReactNode } from "react";
import clsx from "clsx";

interface AdminPageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  breadcrumbs?: ReactNode;
  icon?: ReactNode;
  compact?: boolean;
  className?: string;
}

export function AdminPageHeader({
  title,
  subtitle,
  actions,
  breadcrumbs,
  icon,
  compact = false,
  className,
}: AdminPageHeaderProps) {
  return (
    <header
      className={clsx(
        "border-b border-border transition-fast",
        compact ? "pb-3 space-y-1.5" : "pb-4 space-y-2",
        className
      )}
    >
      {/* Breadcrumbs */}
      {breadcrumbs && (
        <div className="text-xs text-text-muted">
          {breadcrumbs}
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        {/* Title + Subtitle + Icon */}
        <div className="flex items-start gap-2">
          {icon && (
            <div className="text-text-muted mt-0.5">
              {icon}
            </div>
          )}

          <div>
            <h1 className="text-lg font-semibold tracking-tight text-text">
              {title}
            </h1>

            {subtitle && (
              <p className="text-sm text-text-muted mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        {actions && (
          <div className="flex items-center gap-2 shrink-0">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}
