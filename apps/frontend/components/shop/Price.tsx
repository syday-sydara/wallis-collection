import * as React from "react";
import { cn } from "@/lib/cn";

export interface PriceProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Price({ className, children, ...props }: PriceProps) {
  return (
    <div
      className={cn(
        "rounded-md border border-border bg-bg p-4 shadow-sm",
        className
      )}
      {...props}
    >
      {children ?? (
        <span className="text-text-muted text-sm">Price component</span>
      )}
    </div>
  );
}
