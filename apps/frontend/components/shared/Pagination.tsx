import * as React from "react";
import { cn } from "@/lib/cn";

export interface PaginationProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Pagination({ className, children, ...props }: PaginationProps) {
  return (
    <div
      className={cn(
        "rounded-md border border-border bg-bg p-4 shadow-sm",
        className
      )}
      {...props}
    >
      {children ?? (
        <span className="text-text-muted text-sm">Pagination component</span>
      )}
    </div>
  );
}
