export default function ProductDetailSkeleton() {
  return (
    <div className="animate-pulse space-y-24 py-20">
      {/* Main Product Section */}
      <div className="grid md:grid-cols-2 gap-20">
        {/* Image Placeholder */}
        <div className="h-[500px] bg-[var(--color-neutral)]/10 rounded-[var(--radius-xl)]" />

        {/* Product Info Placeholder */}
        <div className="space-y-8">
          <div className="h-4 w-28 bg-[var(--color-neutral)]/20 rounded-[var(--radius-sm)]" />
          <div className="h-10 w-3/4 bg-[var(--color-neutral)]/20 rounded-[var(--radius-md)]" />
          <div className="h-6 w-1/3 bg-[var(--color-neutral)]/20 rounded-[var(--radius-sm)]" />

          <div className="space-y-3">
            <div className="h-4 w-full bg-[var(--color-neutral)]/10 rounded-[var(--radius-sm)]" />
            <div className="h-4 w-5/6 bg-[var(--color-neutral)]/10 rounded-[var(--radius-sm)]" />
            <div className="h-4 w-2/3 bg-[var(--color-neutral)]/10 rounded-[var(--radius-sm)]" />
          </div>

          <div className="h-12 w-40 bg-[var(--color-neutral)]/20 rounded-[var(--radius-md)]" />
        </div>
      </div>

      {/* Related Products Section */}
      <div className="space-y-10">
        <div className="h-6 w-48 bg-[var(--color-neutral)]/20 rounded-[var(--radius-sm)]" />

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-10">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="space-y-4"
            >
              <div className="h-64 bg-[var(--color-neutral)]/10 rounded-[var(--radius-xl)]" />
              <div className="h-4 w-3/4 bg-[var(--color-neutral)]/20 rounded-[var(--radius-sm)]" />
              <div className="h-4 w-1/2 bg-[var(--color-neutral)]/20 rounded-[var(--radius-sm)]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}