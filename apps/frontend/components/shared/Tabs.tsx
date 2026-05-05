import * as React from "react";
import { cn } from "@/lib/cn";

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Tabs({ className, children, ...props }: TabsProps) {
  return (
    <div
      className={cn(
        "rounded-md border border-border bg-bg p-4 shadow-sm",
        className
      )}
      {...props}
    >
      {children ?? (
        <span className="text-text-muted text-sm">Tabs component</span>
      )}
    </div>
  );
}
