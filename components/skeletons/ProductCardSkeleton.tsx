export default function ProductCardSkeleton() {
  return (
    <div className="animate-pulse bg-[var(--color-bg)] border border-[var(--color-neutral)]/20 rounded-[var(--radius-xl)] overflow-hidden shadow-soft">
      {/* Image Placeholder */}
      <div className="h-64 bg-[var(--color-neutral)]/10" />

      {/* Text Placeholder */}
      <div className="p-4 space-y-3">
        <div className="h-4 bg-[var(--color-neutral)]/20 rounded-[var(--radius-sm)] w-3/4" />
        <div className="h-4 bg-[var(--color-neutral)]/20 rounded-[var(--radius-sm)] w-1/2" />
        <div className="h-3 bg-[var(--color-neutral)]/20 rounded-[var(--radius-sm)] w-1/3" />
      </div>
    </div>
  );
}