// components/ui/EmptyState.tsx
import React from "react";

type EmptyStateProps = {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
};

export default function EmptyState({
  title = "No products found",
  description = "Try adjusting your filters or search query.",
  action,
  icon,
}: EmptyStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="flex flex-col items-center justify-center py-16 text-center max-w-xs mx-auto animate-fadeIn"
    >
      {/* Icon */}
      <div
        className="mb-4 text-primary text-4xl leading-none"
        aria-label={title}
      >
        {icon ?? "📦"}
      </div>

      {/* Title */}
      <p className="text-lg font-semibold text-text">{title}</p>

      {/* Description */}
      {description && (
        <p className="mt-2 text-sm text-text-muted max-w-prose">{description}</p>
      )}

      {/* Action */}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}