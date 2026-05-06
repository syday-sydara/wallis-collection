import * as React from "react";
import { cn } from "@/lib/cn";

export interface DataCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  value?: string | number;
  description?: string;
  actions?: React.ReactNode;
}

export function DataCard({
  className,
  children,
  title,
  value,
  description,
  actions,
  ...props
}: DataCardProps) {
  const hasContent = title || value || description || actions;

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
          {title && (
            <h3 className="text-[var(--text-base)] font-medium text-text-primary">
              {title}
            </h3>
          )}

          {/* VALUE */}
          {value && (
            <div className="text-[var(--text-xl)] font-semibold text-text-primary">
              {value}
            </div>
          )}

          {/* DESCRIPTION */}
          {description && (
            <p className="text-[var(--text-sm)] text-text-muted leading-[var(--leading-relaxed)]">
              {description}
            </p>
          )}

          {/* ACTIONS */}
          {actions && (
            <div className="flex items-center gap-[var(--space-2)]">
              {actions}
            </div>
          )}

          {/* FALLBACK */}
          {!hasContent && (
            <span className="text-text-muted text-[var(--text-sm)]">
              DataCard component
            </span>
          )}
        </div>
      )}
    </div>
  );
}
