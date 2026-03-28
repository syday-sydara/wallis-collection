import { listProducts } from "@/lib/catalog/service";

export default async function StorePage({
  searchParams
}: {
  searchParams: { q?: string; min?: string; max?: string };
}) {
  const products = await listProducts({
    search: searchParams.q,
    minPrice: searchParams.min ? Number(searchParams.min) : undefined,
    maxPrice: searchParams.max ? Number(searchParams.max) : undefined
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <section className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <article key={product.id} className="space-y-2">
            <a href={`/product/${product.slug}`}>
              <div className="aspect-[3/4] overflow-hidden bg-neutral-100">
                {product.images[0] && (
                  // replace with next/image in your codebase
                  <img
                    src={product.images[0].url}
                    alt={product.images[0].alt ?? product.name}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <h2 className="mt-2 text-sm font-medium">{product.name}</h2>
              <p className="text-sm text-neutral-600">
                ₦{(product.basePrice / 100).toLocaleString("en-NG")}
              </p>
            </a>
          </article>
        ))}
      </section>
    </main>
  );
}
