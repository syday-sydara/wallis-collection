"use client";

type Props = {
  count?: number;
  className?: string;
};

export default function ProductGridSkeleton({ count = 8, className }: Props) {
  return (
    <div
      role="status"
      aria-label="Loading products"
      aria-busy="true"
      className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 animate-fadeIn-fast ${className ?? ""}`}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          role="listitem"
          key={i}
          className="flex flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-sm animate-fadeIn-fast"
          aria-hidden="true"
        >
          {/* Image placeholder */}
          <div className="w-full aspect-square bg-skeleton rounded-t-lg animate-shimmer" />

          {/* Text placeholders */}
          <div className="flex flex-1 flex-col p-3 space-y-2">
            <div className="h-3 w-3/4 rounded bg-skeleton animate-shimmer" />
            <div className="h-4 w-1/2 rounded bg-skeleton animate-shimmer" />
            <div className="h-3 w-1/4 rounded bg-skeleton animate-shimmer" />

            {/* Button placeholder */}
            <div className="mt-2 h-10 w-full rounded bg-skeleton animate-shimmer min-h-touch" />
          </div>
        </div>
      ))}
    </div>
  );
}
