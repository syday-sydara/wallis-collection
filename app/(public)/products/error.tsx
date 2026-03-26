// File: app/(public)/products/error.tsx
"use client";

export default function ProductsError({ error }: { error: Error }) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-red-600">
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p>{error.message}</p>
    </div>
  );
}
