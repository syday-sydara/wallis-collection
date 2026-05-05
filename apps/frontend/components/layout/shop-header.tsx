import * as React from "react";
import { cn } from "@/lib/cn";

export interface ShopHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ShopHeader({ className, children, ...props }: ShopHeaderProps) {
  return (
    <div
      className={cn(
        "p-4 border-b border-border bg-bg",
        className
      )}
      {...props}
    >
      {children ?? (
        <span className="text-text-muted">ShopHeader</span>
      )}
    </div>
  );
}
