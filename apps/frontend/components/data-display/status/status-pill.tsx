import * as React from "react";
import { cn } from "@/lib/cn";

const statusColors = {
  // payment statuses
  paid: "bg-status-paid/10 text-status-paid",
  pending: "bg-status-pending/10 text-status-pending",
  failed: "bg-status-failed/10 text-status-failed",
  processing: "bg-status-processing/10 text-status-processing",

  // inventory statuses
  instock: "bg-inventory-instock/10 text-inventory-instock",
  low: "bg-inventory-low/10 text-inventory-low",
  out: "bg-inventory-out/10 text-inventory-out",

  // queue statuses
  active: "bg-queue-active/10 text-queue-active",
  waiting: "bg-queue-waiting/10 text-queue-waiting",
  failedQueue: "bg-queue-failed/10 text-queue-failed",
  delayed: "bg-queue-delayed/10 text-queue-delayed",
};

export type Status = keyof typeof statusColors;

export interface StatusPillProps {
  status: Status;
  label?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function StatusPill({ status, label, icon, className }: StatusPillProps) {
  const colorClass = statusColors[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-[var(--space-1)]",
        "px-[var(--space-2)] py-[var(--space-1)]",
        "text-[var(--text-xs)] font-medium rounded-full capitalize",
        colorClass,
        className
      )}
    >
      {icon && <span className="text-current">{icon}</span>}
      {label ?? status.replace(/([A-Z])/g, " $1").trim()}
    </span>
  );
}
