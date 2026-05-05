import * as React from "react";
import { cn } from "@/lib/cn";

export interface MetricProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Metric({ className, children, ...props }: MetricProps) {
  return (
    <div
      className={cn(
        "rounded-md border border-border bg-bg p-4 shadow-sm",
        className
      )}
      {...props}
    >
      {children ?? (
        <span className="text-text-muted text-sm">Metric component</span>
      )}
    </div>
  );
}
