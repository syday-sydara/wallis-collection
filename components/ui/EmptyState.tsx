type EmptyStateProps = {
  title?: string;
  description?: string;
  action?: React.ReactNode;
};

export default function EmptyState({
  title = "No products found",
  description = "Try adjusting your filters or search query.",
  action,
}: EmptyStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="mb-4 text-text-subtle">
        <span className="text-3xl">📦</span>
      </div>

      <p className="text-lg font-medium text-text">{title}</p>

      <p className="mt-1 text-sm text-text-muted">{description}</p>

      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}