import * as React from "react";
import { cn } from "@/lib/cn";
import { StatusDot } from "./status-dot";

const statusLabels = {
  paid: "Paid",
  pending: "Pending",
  failed: "Failed",
  processing: "Processing",

  instock: "In Stock",
  low: "Low Stock",
  out: "Out of Stock",

  active: "Active",
  waiting: "Waiting",
  failedQueue: "Failed",
  delayed: "Delayed",
};

export type StatusLegendType = keyof typeof statusLabels;

export interface StatusLegendProps extends React.HTMLAttributes<HTMLDivElement> {
  statuses?: StatusLegendType[];
}

export function StatusLegend({
  className,
  statuses = Object.keys(statusLabels) as StatusLegendType[],
  ...props
}: StatusLegendProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap gap-[var(--space-3)] items-center",
        className
      )}
      {...props}
    >
      {statuses.map((status) => (
        <div key={status} className="flex items-center gap-[var(--space-1)]">
          <StatusDot status={status} />
          <span className="text-text-secondary text-[var(--text-sm)]">
            {statusLabels[status]}
          </span>
        </div>
      ))}
    </div>
  );
}
