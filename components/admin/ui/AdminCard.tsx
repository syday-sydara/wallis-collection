// components/admin/ui/AdminCard.tsx
import { ReactNode } from "react";
import clsx from "clsx";

export function AdminCard({
  children,
  header,
  footer,
  className,
  elevated = false,
  subtle = false,
  danger = false,
}: {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  className?: string;
  elevated?: boolean;
  subtle?: boolean;
  danger?: boolean;
}) {
  return (
    <section
      role="region"
      className={clsx(
        "rounded-md border p-4 space-y-3 transition-fast",
        // Base theme
        "border-border bg-surface-card shadow-sm",
        // Elevation
        elevated && "shadow-md",
        // Optional hover elevation (the improvement)
        !elevated && "hover:shadow-md",
        // Subtle variant (used in dashboards)
        subtle && "bg-surface-muted/40",
        // Danger variant (for alerts, high-risk cards)
        danger && "border-danger bg-danger/10",
        className
      )}
    >
      {header && (
        <header className="pb-2 border-b border-border text-sm font-medium text-text">
          {header}
        </header>
      )}

      <div className="text-text">{children}</div>

      {footer && (
        <footer className="pt-2 border-t border-border text-sm text-text-muted">
          {footer}
        </footer>
      )}
    </section>
  );
}
