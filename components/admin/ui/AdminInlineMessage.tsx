// components/admin/ui/AdminInlineMessage.tsx
import { ReactNode } from "react";
import clsx from "clsx";

interface AdminInlineMessageProps {
  type?: "info" | "success" | "warning" | "error";
  children: ReactNode;
  className?: string;
}

const typeClasses: Record<
  NonNullable<AdminInlineMessageProps["type"]>,
  string
> = {
  info: "text-info",
  success: "text-success",
  warning: "text-warning",
  error: "text-danger",
};

export function AdminInlineMessage({
  type = "info",
  children,
  className,
}: AdminInlineMessageProps) {
  return (
    <p
      className={clsx(
        "text-[11px] transition-fast",
        typeClasses[type],
        className
      )}
    >
      {children}
    </p>
  );
}
