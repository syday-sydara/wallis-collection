"use client";

export default function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div
      role="status"
      aria-label="Loading products"
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-sm animate-pulse"
        >
          <div className="relative w-full aspect-square bg-skeleton rounded-t-md" />
          <div className="flex flex-1 flex-col p-3 space-y-2">
            <div className="h-3 w-3/4 rounded bg-skeleton" />
            <div className="h-4 w-1/2 rounded bg-skeleton" />
            <div className="h-3 w-1/4 rounded bg-skeleton" />
            <div className="mt-2 h-6 w-full rounded bg-skeleton" />
          </div>
        </div>
      ))}
    </div>
  );
}