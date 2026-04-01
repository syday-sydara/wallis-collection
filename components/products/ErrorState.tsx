// components/ui/ErrorState.tsx
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
      <div className="mb-4 text-danger text-4xl">{icon ?? "⚠️"}</div>

      {/* Title */}
      <p className="text-lg font-semibold text-text">{title}</p>

      {/* Description */}
      <p className="mt-2 text-sm text-text-muted">{description}</p>

      {/* Optional Action */}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}