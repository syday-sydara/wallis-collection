import * as React from "react";
import { cn } from "@/lib/cn";

export interface AddToCartButtonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function AddToCartButton({ className, children, ...props }: AddToCartButtonProps) {
  return (
    <div
      className={cn(
        "rounded-md border border-border bg-bg p-4 shadow-sm",
        className
      )}
      {...props}
    >
      {children ?? (
        <span className="text-text-muted text-sm">AddToCartButton component</span>
      )}
    </div>
  );
}
