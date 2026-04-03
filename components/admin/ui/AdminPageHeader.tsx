import { ReactNode } from "react";
import clsx from "clsx";

export function AdminPageHeader({
  title,
  subtitle,
  actions,
  breadcrumbs,
  className
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  breadcrumbs?: ReactNode;
  className?: string;
}) {
  return (
    <header className={clsx("space-y-2 border-b border-border pb-4", className)}>
      {breadcrumbs && (
        <div className="text-xs text-text-muted">
          {breadcrumbs}
        </div>
      )}

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