import React, { Suspense, useState, useEffect } from "react";
import { prisma } from "@/lib/db";
import ProductGrid, { Product } from "@/components/products/ProductGrid";
import Loading from "@/components/products/Loading";
import { cache } from "react";

// -------------------------
// Server-side fetch + ISR
// -------------------------
const getAllProducts = cache(async (): Promise<Product[]> => {
  const products = await prisma.product.findMany({
    where: { deletedAt: null },
    include: { images: { orderBy: { position: "asc" } } },
    orderBy: { createdAt: "desc" },
    take: 50, // initial batch
  });

  return products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    priceNaira: p.priceNaira,
    salePriceNaira: p.salePriceNaira ?? undefined,
    images: p.images?.map((img) => ({ url: img.url })) ?? [],
    isNew: p.isNew ?? false,
    isOnSale: p.salePriceNaira != null,
    stock: p.stock,
  }));
});

export const revalidate = 300; // 5 min ISR

// -------------------------
// Infinite Scroll Hook
// -------------------------
function useInfiniteProducts(initial: Product[]) {
  const [products, setProducts] = useState(initial);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchMore = async () => {
    setLoadingMore(true);
    try {
      const res = await fetch(`/api/products?page=${page + 1}`);
      const newProducts: Product[] = await res.json();
      if (newProducts.length > 0) {
        setProducts((prev) => [...prev, ...newProducts]);
        setPage((prev) => prev + 1);
      }
    } catch (err) {
      console.error("Failed to load more products:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  return { products, fetchMore, loadingMore };
}

// -------------------------
// Infinite Scroll Trigger
// -------------------------
function InfiniteScrollTrigger({ onInView }: { onInView: () => void }) {
  const ref = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) onInView();
    });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [onInView]);

  return <div ref={ref} className="h-8" />;
}

// -------------------------
// Page Component
// -------------------------
export default async function ProductsPage() {
  const initialProducts = await getAllProducts();

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="heading-2 mb-6">All Products</h1>

      <Suspense fallback={<Loading count={8} message="Loading products..." />}>
        <ClientProductGrid initialProducts={initialProducts} />
      </Suspense>
    </main>
  );
}

// -------------------------
// Client-Side Product Grid
// -------------------------
function ClientProductGrid({ initialProducts }: { initialProducts: Product[] }) {
  const { products, fetchMore, loadingMore } = useInfiniteProducts(initialProducts);

  return (
    <>
      <ProductGrid products={products} skeletonCount={8} loading={loadingMore} />

      {/* Infinite Scroll Trigger */}
      <InfiniteScrollTrigger onInView={fetchMore} />

      {loadingMore && (
        <div className="mt-4 flex justify-center">
          <Loading count={4} showSpinner message="Loading more products..." />
        </div>
      )}
    </>
  );
}