// File: app/(public)/products/loading.tsx
import Loading from "@/components/products/Loading";

export default function LoadingProducts() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Loading count={8} message="Loading products..." />
    </div>
  );
}
