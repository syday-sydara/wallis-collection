// components/admin/ui/AdminPageActions.tsx
import { ReactNode } from "react";
import clsx from "clsx";

interface AdminPageActionsProps {
  children: ReactNode;
  className?: string;
}

export function AdminPageActions({
  children,
  className,
}: AdminPageActionsProps) {
  return (
    <div
      className={clsx(
        "flex items-center justify-end gap-2 py-2",
        "border-b border-border bg-surface-card",
        className
      )}
    >
      {children}
    </div>
  );
}
