import * as React from "react";
import { cn } from "@/lib/cn";

export interface FormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Form({ className, children, ...props }: FormProps) {
  return (
    <div
      className={cn(
        "rounded-md border border-border bg-bg p-4",
        className
      )}
      {...props}
    >
      {children ?? (
        <span className="text-text-muted text-sm">Form component</span>
      )}
    </div>
  );
}
