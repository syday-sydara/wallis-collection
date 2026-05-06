import * as React from "react";
import { cn } from "@/lib/cn";

export interface MetricProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  value?: string | number;
  trend?: string;
  icon?: React.ReactNode;
}

export function Metric({
  className,
  children,
  label,
  value,
  trend,
  icon,
  ...props
}: MetricProps) {
  const hasContent = label || value || trend || icon;

  return (
    <div
      className={cn(
        "rounded-md border border-border bg-bg p-[var(--space-4)] shadow-sm",
        className
      )}
      {...props}
    >
      {children ?? (
        <div className="flex items-start justify-between gap-[var(--space-4)]">
          {/* LEFT SIDE: LABEL + VALUE + TREND */}
          <div className="flex flex-col gap-[var(--space-2)]">
            {label && (
              <span className="text-[var(--text-sm)] text-text-secondary">
                {label}
              </span>
            )}

            {value && (
              <span className="text-[var(--text-2xl)] font-semibold text-text-primary">
                {value}
              </span>
            )}

            {trend && (
              <span className="text-[var(--text-xs)] text-text-muted">
                {trend}
              </span>
            )}
          </div>

          {/* RIGHT SIDE: ICON */}
          {icon && (
            <div className="text-brand text-[var(--text-xl)]">
              {icon}
            </div>
          )}

          {!hasContent && (
            <span className="text-text-muted text-[var(--text-sm)]">
              Metric component
            </span>
          )}
        </div>
      )}
    </div>
  );
}
