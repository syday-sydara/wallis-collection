import * as React from "react";
import { cn } from "@/lib/cn";

export interface DataGridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: number;
}

export function DataGrid({
  className,
  children,
  columns = 2,
  ...props
}: DataGridProps) {
  return (
    <div
      className={cn(
        "grid gap-[var(--space-4)]",
        `grid-cols-1 sm:grid-cols-${columns}`,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
