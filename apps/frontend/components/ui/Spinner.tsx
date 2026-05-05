import * as React from "react";
import { cn } from "@/lib/cn";

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
}

export function Spinner({ size = "md", className, ...props }: SpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-5 w-5 border-2",
    lg: "h-8 w-8 border-4",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-border border-t-transparent",
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
}
