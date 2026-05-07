import * as React from "react";
import { cn } from "@/lib/cn";

export interface ReservationRowProps extends React.HTMLAttributes<HTMLDivElement> {
  name?: string;
  reservationId?: string;
  date?: string;
  status?: "paid" | "pending" | "failed" | "processing";
  actions?: React.ReactNode;
}

export function ReservationRow({
  className,
  children,
  name,
  reservationId,
  date,
  status,
  actions,
  ...props
}: ReservationRowProps) {
  const hasData = name || reservationId || date || status || actions;

  return (
    <div
      className={cn(
        "rounded-md border border-border bg-bg p-[var(--space-4)] shadow-sm",
        "flex items-center justify-between gap-[var(--space-4)]",
        className
      )}
      {...props}
    >
      {children ?? (
        <>
          {/* LEFT SIDE: DETAILS */}
          <div className="flex flex-col gap-[var(--space-1)]">
            {name && (
              <span className="text-text-primary font-medium text-[var(--text-base)]">
                {name}
              </span>
            )}

            {reservationId && (
              <span className="text-text-muted text-[var(--text-sm)]">
                #{reservationId}
              </span>
            )}

            {date && (
              <span className="text-text-secondary text-[var(--text-sm)]">
                {date}
              </span>
            )}
          </div>

          {/* STATUS */}
          {status && (
            <span
              className={cn(
                "px-[var(--space-3)] py-[var(--space-1)] rounded-[var(--radius-md)] text-[var(--text-sm)] font-medium",
                "bg-bg-subtle border border-border"
              )}
              style={{
                color: `var(--status-${status})`,
                borderColor: `var(--status-${status})`,
              }}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          )}

          {/* ACTIONS */}
          {actions && <div className="flex items-center gap-[var(--space-2)]">{actions}</div>}

          {/* FALLBACK */}
          {!hasData && (
            <span className="text-text-muted text-[var(--text-sm)]">
              ReservationRow component
            </span>
          )}
        </>
      )}
    </div>
  );
}
