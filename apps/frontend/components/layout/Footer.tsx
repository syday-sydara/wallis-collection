import * as React from "react";
import { cn } from "@/lib/cn";

export interface FooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Footer({ className, children, ...props }: FooterProps) {
  return (
    <div
      className={cn(
        "p-4 border-t border-border bg-bg",
        className
      )}
      {...props}
    >
      {children ?? (
        <span className="text-text-muted">Footer</span>
      )}
    </div>
  );
}
