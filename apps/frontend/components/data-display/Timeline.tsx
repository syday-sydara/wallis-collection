import * as React from "react";
import { cn } from "@/lib/cn";

export interface TimelineProps extends React.HTMLAttributes<HTMLDivElement> {
  items?: number;
}

export function Timeline({ className, items = 3, ...props }: TimelineProps) {
  return (
    <div className={cn("space-y-4", className)} {...props}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="border-l-2 border-border pl-4">
          <div className="h-3 w-1/3 bg-bg-muted rounded mb-1" />
          <div className="h-3 w-1/2 bg-bg-muted rounded" />
        </div>
      ))}
    </div>
  );
}
