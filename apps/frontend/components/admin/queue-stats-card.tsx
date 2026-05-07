import * as React from "react";
import { cn } from "@/lib/cn";

export interface QueueStatsCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  active?: number;
  waiting?: number;
  failed?: number;
  delayed?: number;
}

export function QueueStatsCard({
  className,
  children,
  title = "Queue Stats",
  active,
  waiting,
  failed,
  delayed,
  ...props
}: QueueStatsCardProps) {
  const hasStats =
    active !== undefined ||
    waiting !== undefined ||
    failed !== undefined ||
    delayed !== undefined;

  return (
    <div
      className={cn(
        "rounded-md border border-border bg-bg p-[var(--space-4)] shadow-sm",
        className
      )}
      {...props}
    >
      {children ?? (
        <div className="flex flex-col gap-[var(--space-4)]">
          {/* TITLE */}
          <h3 className="text-[var(--text-base)] font-medium text-text-primary">
            {title}
          </h3>

          {/* METRICS */}
          {hasStats ? (
            <div className="grid grid-cols-2 gap-[var(--space-4)] text-[var(--text-sm)]">
              <QueueStat label="Active" value={active} color="var(--queue-active)" />
              <QueueStat label="Waiting" value={waiting} color="var(--queue-waiting)" />
              <QueueStat label="Failed" value={failed} color="var(--queue-failed)" />
              <QueueStat label="Delayed" value={delayed} color="var(--queue-delayed)" />
            </div>
          ) : (
            <span className="text-text-muted text-[var(--text-sm)]">
              QueueStatsCard component
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function QueueStat({
  label,
  value,
  color,
}: {
  label: string;
  value?: number;
  color: string;
}) {
  return (
    <div className="flex flex-col gap-[var(--space-1)]">
      <span className="text-text-secondary">{label}</span>
      <span
        className="font-semibold text-[var(--text-lg)]"
        style={{ color }}
      >
        {value ?? 0}
      </span>
    </div>
  );
}
