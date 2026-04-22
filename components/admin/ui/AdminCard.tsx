"use client";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";

type AdminCardProps = React.HTMLAttributes<HTMLDivElement> & {
  header?: string;
  elevated?: boolean;
  subtle?: boolean;
  danger?: boolean;
};

export function AdminCard({
  header,
  elevated,
  subtle,
  danger,
  className,
  children,
  ...props
}: AdminCardProps) {
  return (
    <Card
      className={cn(
        "transition-shadow",
        elevated && "shadow-md",
        subtle && "bg-surface-muted border-border-muted",
        danger && "border-danger/20 bg-danger/5",
        className
      )}
      {...props}
    >
      {header && (
        <div className="border-b border-border pb-3 mb-4">
          <h3 className="text-sm font-medium text-text-muted uppercase tracking-wide">
            {header}
          </h3>
        </div>
      )}
      {children}
    </Card>
  );
}

// Re-export Card for backward compatibility
export { Card } from "@/components/ui/Card";