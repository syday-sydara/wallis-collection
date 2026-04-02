// components/admin/ui/AdminCard.tsx
import { ReactNode } from "react";

export function AdminCard({
  children,
  header,
  footer
}: {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="rounded-md border border-border bg-surface p-4 shadow-sm space-y-3">
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