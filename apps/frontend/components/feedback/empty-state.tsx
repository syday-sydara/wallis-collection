import * as React from "react";
import { cn } from "@/lib/cn";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {}

export function EmptyState({ className, children, ...props }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-md border border-border bg-bg p-4 shadow-sm",
        className
      )}
      {...props}
    >
      {children ?? (
        <span className="text-text-muted text-sm">EmptyState component</span>
      )}
    </div>
  );
}
