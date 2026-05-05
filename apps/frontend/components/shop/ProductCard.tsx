import * as React from "react";
import { cn } from "@/lib/cn";

export interface ProductCardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ProductCard({ className, children, ...props }: ProductCardProps) {
  return (
    <div
      className={cn(
        "rounded-md border border-border bg-bg p-4 shadow-sm",
        className
      )}
      {...props}
    >
      {children ?? (
        <span className="text-text-muted text-sm">ProductCard component</span>
      )}
    </div>
  );
}
