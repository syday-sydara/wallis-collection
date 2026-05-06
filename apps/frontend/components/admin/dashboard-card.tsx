import * as React from "react";
import { cn } from "@/lib/cn";

export interface DashboardCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  value?: string | number;
  description?: string;
  icon?: React.ReactNode;
}

export function DashboardCard({
  className,
  children,
  title,
  value,
  description,
  icon,
  ...props
}: DashboardCardProps) {
  const hasContent = title || value || description || icon;

  return (
    <div
      className={cn(
        "rounded-md border border-border bg-bg p-[var(--space-4)] shadow-sm",
        className
      )}
      {...props}
    >
      {children ?? (
        <div className="flex flex-col gap-[var(--space-3)]">
          {/* ICON */}
          {icon && (
            <div className="text-brand text-[var(--text-xl)]">
              {icon}
            </div>
          )}

          {/* TITLE */}
          {title && (
            <h3 className="text-[var(--text-sm)] font-medium text-text-secondary">
              {title}
            </h3>
          )}

          {/* VALUE */}
          {value && (
            <div className="text-[var(--text-2xl)] font-semibold text-text-primary">
              {value}
            </div>
          )}

          {/* DESCRIPTION */}
          {description && (
            <p className="text-[var(--text-sm)] text-text-muted leading-[var(--leading-relaxed)]">
              {description}
            </p>
          )}

          {/* FALLBACK */}
          {!hasContent && (
            <span className="text-text-muted text-[var(--text-sm)]">
              DashboardCard component
            </span>
          )}
        </div>
      )}
    </div>
  );
}
