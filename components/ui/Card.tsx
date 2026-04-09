"use client";

import { cn } from "@/lib/utils";

type Padding = "none" | "sm" | "md" | "lg";

export type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  padding?: Padding;
};

const paddingClasses: Record<Padding, string> = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
};

export function Card({ padding = "md", className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-surface shadow-sm",
        paddingClasses[padding],
        className
      )}
      {...props}
    />
  );
}