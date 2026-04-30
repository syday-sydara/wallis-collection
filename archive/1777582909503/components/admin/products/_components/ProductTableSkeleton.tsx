export default function ProductTableSkeleton() {
  return (
    <div className="border border-border-default rounded-md overflow-hidden">
      {/* Header skeleton */}
      <div className="grid grid-cols-6 bg-muted/40 border-b border-border-default">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="p-3">
            <div className="h-4 w-24 skeleton" />
          </div>
        ))}
      </div>

      {/* Rows */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-6 border-b border-border-default h-12 items-center px-3"
        >
          <div className="skeleton h-4 w-32" />
          <div className="skeleton h-4 w-28" />
          <div className="skeleton h-4 w-20" />
          <div className="skeleton h-4 w-12" />
          <div className="skeleton h-4 w-24" />
          <div className="flex justify-end">
            <div className="skeleton h-8 w-20 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
