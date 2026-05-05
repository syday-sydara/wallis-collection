import * as React from "react";
import { cn } from "@/lib/cn";

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Toast({ className, children, ...props }: ToastProps) {
  return (
    <div
      className={cn(
        "rounded-md border border-border bg-bg p-4 shadow-sm",
        className
      )}
      {...props}
    >
      {children ?? (
        <span className="text-text-muted text-sm">Toast component</span>
      )}
    </div>
  );
}
