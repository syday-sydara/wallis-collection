import * as React from "react";
import { cn } from "@/lib/cn";

export interface QueueStatsCardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function QueueStatsCard({ className, children, ...props }: QueueStatsCardProps) {
  return (
    <div
      className={cn(
        "rounded-md border border-border bg-bg p-4 shadow-sm",
        className
      )}
      {...props}
    >
      {children ?? (
        <span className="text-text-muted text-sm">QueueStatsCard component</span>
      )}
    </div>
  );
}
