export default function Loading() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading product details"
      className="mx-auto max-w-6xl px-4 py-10 grid gap-10 md:grid-cols-2 animate-pulse motion-safe:animate-pulse"
    >
      {/* Image Skeleton */}
      <div
        aria-hidden="true"
        className="aspect-[3/4] rounded-md bg-skeleton"
      />

      {/* Content Skeleton */}
      <section className="space-y-6">
        {/* Title + Price */}
        <div className="space-y-2">
          <div aria-hidden="true" className="h-6 w-2/3 bg-skeleton rounded-md" />
          <div aria-hidden="true" className="h-4 w-1/3 bg-skeleton rounded-md" />
        </div>

        {/* Description */}
        <div aria-hidden="true" className="h-20 w-full bg-skeleton rounded-md" />

        {/* Variant Selector */}
        <div aria-hidden="true" className="h-10 w-full bg-skeleton rounded-md" />

        {/* Add to Cart + Extra Blocks */}
        <div className="pt-6 border-t border-border space-y-4">
          <div aria-hidden="true" className="h-16 bg-skeleton rounded-md" />
          <div aria-hidden="true" className="h-16 bg-skeleton rounded-md" />
        </div>
      </section>
    </main>
  );
}