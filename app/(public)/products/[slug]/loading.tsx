// File: app/(public)/products/[slug]/loading.tsx
import Loading from "@/components/products/Loading";

export default function LoadingProduct() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Loading count={1} message="Loading product..." />
    </div>
  );
}
