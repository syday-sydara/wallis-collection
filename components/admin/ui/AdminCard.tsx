// components/admin/ui/AdminCard.tsx
import { ReactNode } from "react";
import clsx from "clsx";

export function AdminCard({
  children,
  header,
  footer,
  className,
  elevated = false,
}: {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  className?: string;
  elevated?: boolean;
}) {
  return (
    <div
      className={clsx(
        "rounded-md border border-border bg-surface-card p-4 space-y-3",
        elevated && "shadow-md",
        !elevated && "shadow-sm",
        className
      )}
    >
      {header && (
        <div className="pb-2 border-b border-border text-sm font-medium text-text">
          {header}
        </div>
      )}

      <div className="text-text">{children}</div>

      {footer && (
        <div className="pt-2 border-t border-border text-sm text-text-muted">
          {footer}
        </div>
      )}
    </div>
  );
}