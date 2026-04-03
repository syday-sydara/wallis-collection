// components/admin/ui/AdminCard.tsx
import { ReactNode } from "react";
import clsx from "clsx";

export function AdminCard({
  children,
  header,
  footer,
  className
}: {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "rounded-md border border-border bg-surface p-4 shadow-sm space-y-3",
        className
      )}
    >
      {header && (
        <div className="pb-2 border-b border-border text-sm font-medium text-text">
          {header}
        </div>
      )}

      {children}

      {footer && (
        <div className="pt-2 border-t border-border">
          {footer}
        </div>
      )}
    </div>
  );
}