// components/admin/ui/AdminPageHeader.tsx
import { ReactNode } from "react";

export function AdminPageHeader({
  title,
  subtitle,
  actions,
  breadcrumbs
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  breadcrumbs?: ReactNode;
}) {
  return (
    <header className="space-y-2 border-b border-border pb-4">
      {/* Breadcrumbs */}
      {breadcrumbs && (
        <div className="text-xs text-text-muted">
          {breadcrumbs}
        </div>
      )}

      {/* Title + Actions */}
      <div className="flex items-center justify-between">
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

        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}