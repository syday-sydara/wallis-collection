import { ReactNode } from "react";
import clsx from "clsx";

interface AdminFormRowProps {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export function AdminFormRow({
  children,
  columns = 2,
  className,
}: AdminFormRowProps) {
  return (
    <div
      className={clsx(
        "grid gap-3",
        columns === 1 && "grid-cols-1",
        columns === 2 && "grid-cols-1 sm:grid-cols-2",
        columns === 3 && "grid-cols-1 sm:grid-cols-3",
        columns === 4 && "grid-cols-1 sm:grid-cols-4",
        className
      )}
    >
      {children}
    </div>
  );
}