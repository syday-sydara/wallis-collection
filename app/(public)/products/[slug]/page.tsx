// File: app/(public)/products/[slug]/page.tsx
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import ProductGallery from "@/components/ui/ProductGallery";
import AddToCartSection from "@/components/ui/AddToCartSection";

type Props = {
  params: { slug: string };
};

export default async function ProductDetailPage({ params }: Props) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
  });

  if (!product) return notFound();

  const relatedProducts = await prisma.product.findMany({
    where: {
      category: product.category ?? undefined,
      NOT: { id: product.id },
    },
    take: 4,
  });

  const price = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(product.priceCents / 100);

  return (
    <div className="container py-16 space-y-20">
      {/* Main Section */}
      <div className="grid md:grid-cols-2 gap-16">
        
        <ProductGallery images={product.images as string[]} />

        <div className="space-y-6">
          {product.category && (
            <span className="text-sm text-accent uppercase tracking-wide">
              {product.category}
            </span>
          )}

          <h1 className="text-3xl font-heading text-primary">
            {product.name}
          </h1>

          <p className="text-2xl font-semibold text-secondary">
            {price}
          </p>

          {product.description && (
            <p className="text-neutral leading-relaxed">
              {product.description}
            </p>
          )}

          <AddToCartSection product={product} />
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-6 text-primary">
            Related Products
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {relatedProducts.map((p) => (
              <div key={p.id} className="border rounded-lg p-4">
                <a href={`/products/${p.slug}`}>
                  {p.name}
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}