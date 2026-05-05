import * as React from "react";
import { cn } from "@/lib/cn";

export interface DataCardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DataCard({ className, children, ...props }: DataCardProps) {
  return (
    <div
      className={cn(
        "rounded-md border border-border bg-bg p-4 shadow-sm",
        className
      )}
      {...props}
    >
      {children ?? (
        <span className="text-text-muted text-sm">DataCard component</span>
      )}
    </div>
  );
}
