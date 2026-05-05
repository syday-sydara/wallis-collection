import * as React from "react";
import { cn } from "@/lib/cn";

export interface DashboardCardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DashboardCard({ className, children, ...props }: DashboardCardProps) {
  return (
    <div
      className={cn(
        "rounded-md border border-border bg-bg p-4 shadow-sm",
        className
      )}
      {...props}
    >
      {children ?? (
        <span className="text-text-muted text-sm">DashboardCard component</span>
      )}
    </div>
  );
}
