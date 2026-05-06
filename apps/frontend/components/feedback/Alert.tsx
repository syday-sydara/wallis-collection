import * as React from "react";
import { cn } from "@/lib/cn";

const alertColors = {
  info: "bg-status-processing/10 text-status-processing border-status-processing",
  success: "bg-status-paid/10 text-status-paid border-status-paid",
  warning: "bg-status-pending/10 text-status-pending border-status-pending",
  error: "bg-status-failed/10 text-status-failed border-status-failed",
};

export type AlertVariant = keyof typeof alertColors;

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}

export function Alert({
  className,
  children,
  variant = "info",
  title,
  description,
  icon,
  ...props
}: AlertProps) {
  const hasContent = title || description || icon;

  return (
    <div
      className={cn(
        "rounded-md border p-[var(--space-4)] shadow-sm",
        alertColors[variant],
        className
      )}
      {...props}
    >
      {children ?? (
        <div className="flex items-start gap-[var(--space-3)]">
          {icon && (
            <div className="text-[var(--text-lg)] leading-none mt-[2px]">
              {icon}
            </div>
          )}

          <div className="space-y-[var(--space-1)]">
            {title && (
              <p className="font-medium text-[var(--text-base)]">{title}</p>
            )}

            {description && (
              <p className="text-[var(--text-sm)] leading-[var(--leading-relaxed)]">
                {description}
              </p>
            )}

            {!hasContent && (
              <span className="text-text-muted text-[var(--text-sm)]">
                Alert component
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
