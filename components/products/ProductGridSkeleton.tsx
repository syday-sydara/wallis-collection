export default function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div
      role="status"
      aria-label="Loading products"
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-lg border border-border bg-surface p-3 shadow-sm"
        >
          {/* Image */}
          <div className="aspect-square w-full rounded-md bg-skeleton" />

          {/* Title */}
          <div className="mt-3 h-3 w-3/4 rounded bg-skeleton" />

          {/* Price */}
          <div className="mt-2 h-4 w-1/2 rounded bg-skeleton" />
        </div>
      ))}
    </div>
  );
}