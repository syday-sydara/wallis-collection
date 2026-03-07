export default function ProductCardSkeleton() {
  return (
    <div className="bg-[var(--color-bg)] border border-[var(--color-neutral)]/20 rounded-[var(--radius-xl)] overflow-hidden shadow-soft">
      <div className="h-64 bg-[var(--color-neutral)]/10 skeleton-shimmer" />

      <div className="p-4 space-y-4">
        <div className="h-4 w-4/5 bg-[var(--color-neutral)]/20 rounded-[var(--radius-sm)] skeleton-shimmer" />
        <div className="h-4 w-1/3 bg-[var(--color-neutral)]/20 rounded-[var(--radius-sm)] skeleton-shimmer" />
        <div className="h-3 w-1/4 bg-[var(--color-neutral)]/20 rounded-[var(--radius-sm)] skeleton-shimmer" />
      </div>
    </div>
  );
}