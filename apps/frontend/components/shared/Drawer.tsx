import * as React from "react";
import { cn } from "@/lib/cn";

export interface DrawerProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Drawer({ className, children, ...props }: DrawerProps) {
  return (
    <div
      className={cn(
        "rounded-md border border-border bg-bg p-4 shadow-sm",
        className
      )}
      {...props}
    >
      {children ?? (
        <span className="text-text-muted text-sm">Drawer component</span>
      )}
    </div>
  );
}
