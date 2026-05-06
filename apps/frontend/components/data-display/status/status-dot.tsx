import * as React from "react";
import { cn } from "@/lib/cn";

const statusColors = {
  paid: "bg-status-paid",
  pending: "bg-status-pending",
  failed: "bg-status-failed",
  processing: "bg-status-processing",

  instock: "bg-inventory-instock",
  low: "bg-inventory-low",
  out: "bg-inventory-out",

  active: "bg-queue-active",
  waiting: "bg-queue-waiting",
  failedQueue: "bg-queue-failed",
  delayed: "bg-queue-delayed",
};

export type StatusDotType = keyof typeof statusColors;

export interface StatusDotProps {
  status: StatusDotType;
  className?: string;
}

export function StatusDot({ status, className }: StatusDotProps) {
  return (
    <span
      className={cn(
        "inline-block h-[var(--space-2)] w-[var(--space-2)] rounded-full",
        statusColors[status],
        className
      )}
    />
  );
}
