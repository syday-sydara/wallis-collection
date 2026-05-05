import * as React from "react";
import { cn } from "@/lib/cn";

export interface AdminSidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function AdminSidebar({ className, children, ...props }: AdminSidebarProps) {
  return (
    <div
      className={cn(
        "p-4 border-b border-border bg-bg",
        className
      )}
      {...props}
    >
      {children ?? (
        <span className="text-text-muted">AdminSidebar</span>
      )}
    </div>
  );
}
