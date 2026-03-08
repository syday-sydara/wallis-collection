// components/products/Loading.tsx
"use client";

export default function Loading() {
  return (
    <div
      className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-4"
      aria-busy="true"
      aria-live="polite"
    >
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-3">

          {/* Image */}
          <div className="aspect-[3/4] w-full skeleton-block rounded-md" />

          {/* Title */}
          <div className="h-4 w-3/4 skeleton-block" />

          {/* Price */}
          <div className="h-4 w-1/3 skeleton-block" />

        </div>
      ))}
    </div>
  );
}