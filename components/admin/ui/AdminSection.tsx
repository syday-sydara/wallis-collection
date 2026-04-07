// components/admin/ui/AdminSection.tsx
import { ReactNode } from "react";
import clsx from "clsx";

interface AdminSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  id?: string;
  icon?: ReactNode;
  compact?: boolean;
}

export function AdminSection({
  title,
  description,
  children,
  className,
  id,
  icon,
  compact = false,
}: AdminSectionProps) {
  return (
    <section
      id={id}
      className={clsx(
        "transition-fast",
        compact ? "space-y-2" : "space-y-3",
        className
      )}
    >
      {/* Title + Description */}
      <div className="flex items-start gap-2">
        {icon && (
          <div className="text-text-muted mt-0.5">
            {icon}
          </div>
        )}

        <div>
          <h3 className="text-sm font-semibold text-text tracking-tight">
            {title}
          </h3>

          {description && (
            <p className="text-xs text-text-muted mt-0.5">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className={clsx(compact ? "space-y-2" : "space-y-3")}>
        {children}
      </div>
    </section>
  );
}
