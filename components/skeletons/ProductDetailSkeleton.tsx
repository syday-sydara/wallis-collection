export default function ProductDetailSkeleton() {
  return (
    <div className="animate-pulse space-y-24 py-20">
      {/* Main Product Section */}
      <div className="grid md:grid-cols-2 gap-20">
        {/* Image Placeholder */}
        <div className="h-[500px] bg-[var(--color-neutral)]/10 rounded-[var(--radius-xl)]" />

        {/* Product Info Placeholder */}
        <div className="space-y-6">
          <div className="h-4 w-24 bg-[var(--color-neutral)]/20 rounded-[var(--radius-sm)]" />
          <div className="h-8 w-3/4 bg-[var(--color-neutral)]/20 rounded-[var(--radius-md)]" />
          <div className="h-6 w-1/3 bg-[var(--color-neutral)]/20 rounded-[var(--radius-sm)]" />
          <div className="h-24 bg-[var(--color-neutral)]/10 rounded-[var(--radius-md)]" />
          <div className="h-12 bg-[var(--color-neutral)]/20 rounded-[var(--radius-md)]" />
        </div>
      </div>

      {/* Related Products Section */}
      <div className="space-y-6">
        <div className="h-6 w-40 bg-[var(--color-neutral)]/20 rounded-[var(--radius-sm)]" />

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-10">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-64 bg-[var(--color-neutral)]/10 rounded-[var(--radius-xl)]"
            />
          ))}
        </div>
      </div>
    </div>
  );
}