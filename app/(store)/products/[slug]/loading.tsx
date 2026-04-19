export default function Loading() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading product details"
      className="mx-auto max-w-6xl px-4 py-10 grid gap-10 md:grid-cols-2 animate-fadeIn-fast"
    >
      {/* Image Skeleton */}
      <div
        role="presentation"
        className="aspect-[3/4] rounded-md bg-skeleton animate-shimmer"
      />

      {/* Content Skeleton */}
      <section className="space-y-6">
        {/* Title + Price */}
        <div className="space-y-2">
          <div role="presentation" className="h-6 w-2/3 bg-skeleton rounded-md animate-shimmer" />
          <div role="presentation" className="h-4 w-1/3 bg-skeleton rounded-md animate-shimmer" />
        </div>

        {/* Description */}
        <div role="presentation" className="h-20 w-full bg-skeleton rounded-md animate-shimmer" />

        {/* Variant Selector */}
        <div role="presentation" className="h-10 w-full bg-skeleton rounded-md animate-shimmer" />

        {/* Add to Cart + Extra Blocks */}
        <div className="pt-6 border-t border-border space-y-4">
          <div role="presentation" className="h-16 bg-skeleton rounded-md animate-shimmer" />
          <div role="presentation" className="h-16 bg-skeleton rounded-md animate-shimmer" />
        </div>
      </section>
    </main>
  );
}
