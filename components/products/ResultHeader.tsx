export default function ResultHeader({ count }: { count: number }) {
  const safeCount = Number(count) || 0;
  const label = safeCount === 1 ? "product" : "products";

  return (
    <div
      aria-live="polite"
      aria-label={`${safeCount} ${label} found`}
      className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between animate-fadeIn-fast leading-none"
    >
      <h2 className="text-lg font-semibold text-text">
        {safeCount} {label}
      </h2>
    </div>
  );
}