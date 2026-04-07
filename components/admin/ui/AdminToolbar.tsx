// components/admin/ui/AdminToolbar.tsx
import { ReactNode } from "react";
import clsx from "clsx";

interface AdminToolbarProps {
  children: ReactNode;
  className?: string;
  align?: "left" | "right" | "between";
}

export function AdminToolbar({
  children,
  className,
  align = "between",
}: AdminToolbarProps) {
  return (
    <div
      className={clsx(
        "flex items-center gap-3 py-2",
        align === "left" && "justify-start",
        align === "right" && "justify-end",
        align === "between" && "justify-between",
        className
      )}
    >
      {children}
    </div>
  );
}
