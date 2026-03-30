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
      className="flex flex-col items-center justify-center py-16 px-4 text-center max-w-md mx-auto"
    >
      {/* Icon */}
      {icon && <div className="mb-4 text-danger">{icon}</div>}
      {!icon && (
        <div className="mb-4 text-danger text-4xl">⚠️</div>
      )}

      <p className="text-lg font-medium text-text">{title}</p>

      <p className="mt-1 text-sm text-text-muted">{description}</p>

      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}