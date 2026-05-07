import * as React from "react";
import { cn } from "@/lib/cn";

export interface TableProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Table({ className, children, ...props }: TableProps) {
  return (
    <div
      className={cn(
        "rounded-md border border-border bg-bg",
        "overflow-hidden text-[var(--text-sm)]",
        className
      )}
      {...props}
    >
      {children ?? (
        <div className="p-[var(--space-4)] text-text-muted">
          Table placeholder
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------
   OPTIONAL IMPROVEMENTS (Subcomponents)
---------------------------------------------- */

Table.Header = function TableHeader({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "grid grid-cols-4 bg-bg-subtle border-b border-border",
        "px-[var(--space-4)] py-[var(--space-3)]",
        "text-text-secondary font-medium",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

Table.Row = function TableRow({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "grid grid-cols-4 border-b border-border",
        "px-[var(--space-4)] py-[var(--space-3)]",
        "hover:bg-bg-muted transition-colors",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

Table.Cell = function TableCell({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "text-text-primary",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
