// components/admin/ui/AdminSection.tsx
import { ReactNode } from "react";

export function AdminSection({
  title,
  description,
  children
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
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