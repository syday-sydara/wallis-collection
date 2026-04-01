type EmptyStateProps = {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode; // optional custom icon
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
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      {/* Icon */}
      <div className="mb-4 text-primary text-3xl">
        {icon || "📦"}
      </div>

      {/* Title */}
      <p className="text-lg font-semibold text-text">{title}</p>

      {/* Description */}
      <p className="mt-2 text-sm text-text-muted">{description}</p>

      {/* Action */}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}