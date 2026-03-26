// File: app/(public)/products/[slug]/page.tsx
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { mapProductDetail } from "@/lib/mappers/product";
import ClientProductDetail from "./ClientProductDetail";

export const revalidate = 60;

export default async function ProductPage({ params }: { params: { slug: string } }) {
  if (!params.slug) notFound();

  const product = await prisma.product.findUnique({
    where: {
      slug_deletedAt: {
        slug: params.slug,
        deletedAt: null,
      },
    },
    include: {
      images: { orderBy: { position: "asc" } },
      variants: true,
      reviews: {
        include: {
          user: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!product) notFound();

  const mapped = mapProductDetail(product);

  // JSON-LD for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: mapped.name,
    image: mapped.images[0]?.url ?? "/fallback-product.jpg",
    description: mapped.description,
    brand: { "@type": "Brand", name: "Wallis Collection" },
    offers: {
      "@type": "Offer",
      url: `${process.env.NEXT_PUBLIC_URL}/products/${mapped.slug}`,
      priceCurrency: "NGN",
      price: mapped.salePrice ?? mapped.price,
      itemCondition: "https://schema.org/NewCondition",
      availability:
        mapped.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ClientProductDetail product={mapped} />
    </main>
  );
}
