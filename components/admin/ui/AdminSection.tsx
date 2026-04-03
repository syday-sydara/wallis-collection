// components/admin/ui/AdminSection.tsx
import { ReactNode } from "react";
import clsx from "clsx";

export function AdminSection({
  title,
  description,
  children,
  className,
  id
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={clsx("space-y-3", className)}>
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

      <div className="space-y-3">
        {children}
      </div>
    </section>
  );
}