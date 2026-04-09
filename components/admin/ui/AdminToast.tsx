// components/admin/ui/AdminToast.tsx
import { ReactNode } from "react";
import clsx from "clsx";

interface AdminToastProps {
  message: string;
  type?: "success" | "error" | "info" | "warning";
  icon?: ReactNode;
  className?: string;
}

const typeClasses: Record<
  NonNullable<AdminToastProps["type"]>,
  string
> = {
  success: "bg-success/15 text-success border-success/30",
  error: "bg-danger/15 text-danger border-danger/30",
  info: "bg-info/15 text-info border-info/30",
  warning: "bg-warning/15 text-warning border-warning/30",
};

export function AdminToast({
  message,
  type = "info",
  icon,
  className,
}: AdminToastProps) {
  return (
    <div
      className={clsx(
        "inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm shadow-sm transition-fast",
        "bg-surface-card",
        typeClasses[type],
        className
      )}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{message}</span>
    </div>
  );
}
