// components/ui/ErrorState.tsx
import React from "react";

type ErrorStateProps = {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
};

export default function ErrorState({
  title = "Something went wrong",
  description = "There was an error fetching the data.",
  action,
  icon,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className="flex flex-col items-center justify-center py-16 px-4 text-center max-w-md mx-auto animate-fadeIn"
    >
      {/* Icon */}
      <div
        className="mb-4 text-danger text-4xl leading-none"
        aria-label={title}
      >
        {icon ?? "⚠️"}
      </div>

      {/* Title */}
      <p className="text-lg font-semibold text-text">{title}</p>

      {/* Description */}
      {description && (
        <p className="mt-2 text-sm text-text-muted max-w-prose">{description}</p>
      )}

      {/* Optional Action */}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}