type LoadingStateProps = {
  title?: string;
  description?: string;
  spinner?: React.ReactNode;
};

export default function LoadingState({
  title = "Loading...",
  description = "Please wait while we fetch the data.",
  spinner,
}: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center py-16 px-4 text-center max-w-md mx-auto"
    >
      <div className="mb-4 text-text-subtle">
        {spinner || (
          <svg
            className="w-10 h-10 animate-spin text-text-subtle"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>
        )}
      </div>

      <p className="text-lg font-medium text-text">{title}</p>

      <p className="mt-1 text-sm text-text-muted">{description}</p>
    </div>
  );
}