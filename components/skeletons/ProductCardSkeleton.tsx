export default function ProductCardSkeleton() {
  return (
    <div className="animate-pulse bg-bg border border-neutral/20 rounded-xl overflow-hidden shadow-soft">
      <div className="h-64 bg-neutral/10" />

      <div className="p-4 space-y-3">
        <div className="h-4 bg-neutral/20 rounded w-3/4" />
        <div className="h-4 bg-neutral/20 rounded w-1/2" />
        <div className="h-3 bg-neutral/20 rounded w-1/3" />
      </div>
    </div>
  );
}