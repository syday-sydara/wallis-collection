import * as React from "react";
import { cn } from "@/lib/cn";

export interface DataListProps extends React.HTMLAttributes<HTMLDivElement> {
  items?: { label: string; value: React.ReactNode }[];
}

export function DataList({ className, items, children, ...props }: DataListProps) {
  const isEmpty = !items || items.length === 0;

  return (
    <div
      className={cn(
        "rounded-md border border-border bg-bg p-[var(--space-4)]",
        "space-y-[var(--space-4)]",
        className
      )}
      {...props}
    >
      {isEmpty
        ? children ?? (
            <p className="text-text-muted text-[var(--text-sm)]">No data available</p>
          )
        : items.map((item, i) => (
            <div
              key={i}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="text-text-secondary text-[var(--text-sm)]">
                {item.label}
              </span>
              <span className="text-text-primary text-[var(--text-base)] font-medium">
                {item.value}
              </span>
            </div>
          ))}
    </div>
  );
}
