import * as React from "react";
import { cn } from "@/lib/cn";

export interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className, children, ...props }: SidebarProps) {
  return (
    <div
      className={cn(
        "p-4 border-b border-border bg-bg",
        className
      )}
      {...props}
    >
      {children ?? (
        <span className="text-text-muted">Sidebar</span>
      )}
    </div>
  );
}
