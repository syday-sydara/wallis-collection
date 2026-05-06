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

export type TimelineStatus = keyof typeof statusColors;

export interface TimelineItem {
  title: string;
  description?: string;
  time?: string;
  icon?: React.ReactNode;
  status?: TimelineStatus; // ⭐ NEW
}

export interface TimelineProps extends React.HTMLAttributes<HTMLDivElement> {
  items?: TimelineItem[];
  skeletonCount?: number;
}

export function Timeline({
  className,
  items,
  skeletonCount = 3,
  ...props
}: TimelineProps) {
  const isSkeleton = !items || items.length === 0;

  return (
    <div className={cn("space-y-[var(--space-4)]", className)} {...props}>
      {isSkeleton
        ? Array.from({ length: skeletonCount }).map((_, i) => (
            <TimelineSkeleton key={i} />
          ))
        : items.map((item, i) => (
            <TimelineEntry
              key={i}
              {...item}
              isLast={i === items.length - 1}
            />
          ))}
    </div>
  );
}

/* ---------------------------------------------
   TIMELINE ENTRY WITH STATUS DOT
---------------------------------------------- */

function TimelineEntry({
  title,
  description,
  time,
  icon,
  status,
  isLast,
}: TimelineItem & { isLast: boolean }) {
  const colorClass = status ? statusColors[status] : "bg-bg-subtle";

  return (
    <div className="relative pl-[var(--space-6)]">
      {/* Vertical line */}
      {!isLast && (
        <div className="absolute left-[6px] top-[var(--space-6)] bottom-0 w-[2px] bg-border" />
      )}

      {/* Status Dot */}
      <div
        className={cn(
          "absolute left-0 top-[var(--space-1)]",
          "h-[var(--space-4)] w-[var(--space-4)] rounded-full",
          "flex items-center justify-center",
          colorClass
        )}
      >
        {icon && <span className="text-text-inverse text-[var(--text-xs)]">{icon}</span>}
      </div>

      {/* Content */}
      <div className="space-y-[var(--space-1)]">
        <p className="text-text-primary font-medium">{title}</p>

        {description && (
          <p className="text-text-secondary text-[var(--text-sm)] leading-[var(--leading-relaxed)]">
            {description}
          </p>
        )}

        {time && (
          <p className="text-text-muted text-[var(--text-xs)]">{time}</p>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------
   SKELETON ENTRY
---------------------------------------------- */

function TimelineSkeleton() {
  return (
    <div className="relative pl-[var(--space-6)]">
      <div className="absolute left-0 top-[var(--space-1)] h-[var(--space-4)] w-[var(--space-4)] rounded-full bg-bg-muted" />

      <div className="space-y-[var(--space-2)]">
        <div className="h-[var(--space-3)] w-1/3 bg-bg-muted rounded" />
        <div className="h-[var(--space-3)] w-1/2 bg-bg-muted rounded" />
      </div>
    </div>
  );
}
