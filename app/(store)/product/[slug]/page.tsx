import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/catalog/service";

export default async function ProductPage({
  params
}: {
  params: { slug: string };
}) {
  const product = await getProductBySlug(params.slug);
  if (!product || product.isArchived || product.deletedAt) return notFound();

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8 md:flex-row">
      <section className="flex-1 space-y-4">
        <div className="aspect-[3/4] overflow-hidden bg-neutral-100">
          {product.images[0] && (
            <img
              src={product.images[0].url}
              alt={product.images[0].alt ?? product.name}
              className="h-full w-full object-cover"
            />
          )}
        </div>
        {/* thumbnails, gallery, etc. */}
      </section>

      <section className="flex-1 space-y-4">
        <h1 className="text-xl font-semibold">{product.name}</h1>
        <p className="text-sm text-neutral-600">
          ₦{(product.basePrice / 100).toLocaleString("en-NG")}
        </p>
        {product.description && (
          <p className="text-sm text-neutral-700">{product.description}</p>
        )}

        {/* variants */}
        {product.variants.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-sm font-medium">Options</h2>
            <ul className="flex flex-wrap gap-2">
              {product.variants.map((variant) => (
                <li
                  key={variant.id}
                  className="rounded-full border px-3 py-1 text-xs"
                >
                  {variant.name}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* add to cart button wired to your cart system */}
      </section>
    </main>
  );
}
