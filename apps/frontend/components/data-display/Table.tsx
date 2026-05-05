import * as React from "react";
import { cn } from "@/lib/cn";

export interface TableProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Table({ className, children, ...props }: TableProps) {
  return (
    <div
      className={cn(
        "rounded-md border border-border bg-bg p-4 text-sm text-text-muted",
        className
      )}
      {...props}
    >
      {children ?? "Table placeholder"}
    </div>
  );
}
