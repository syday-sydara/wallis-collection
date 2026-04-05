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
        "space-y-3",
        compact && "space-y-2",
        className
      )}
    >
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

      <div className={clsx("space-y-3", compact && "space-y-2")}>
        {children}
      </div>
    </section>
  );
}