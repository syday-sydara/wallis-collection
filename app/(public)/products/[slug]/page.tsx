// File: app/products/[slug]/page.tsx
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import ProductDetailView from "@/components/products/ProductDetailView";

export default async function ProductPage({ params }: { params: { slug: string } }) {
  // Fetch product from DB
  const product = await prisma.product.findUnique({
    where: { slug: params.slug, deletedAt: null },
    include: {
      images: { orderBy: { position: "asc" } },
      reviews: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!product) notFound();

  // Format prices in Naira and add a formattedPrice field
  const formattedProduct = {
    ...product,
    priceNaira: product.price / 100,
    salePriceNaira: product.salePrice ? product.salePrice / 100 : null,
    formattedPrice: product.salePrice
      ? `₦${(product.salePrice / 100).toLocaleString("en-NG")}`
      : `₦${(product.price / 100).toLocaleString("en-NG")}`,
  };

  // Google Structured Data (JSON-LD)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images[0]?.url ?? "/fallback-product.jpg",
    description: product.description,
    brand: { "@type": "Brand", name: "Wallis Collection" },
    offers: {
      "@type": "Offer",
      url: `${process.env.NEXT_PUBLIC_URL}/products/${product.slug}`,
      priceCurrency: "NGN",
      price: formattedProduct.salePriceNaira || formattedProduct.priceNaira,
      itemCondition: "https://schema.org/NewCondition",
      availability: product.stock > 0
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
      <ProductDetailView product={formattedProduct} />
    </main>
  );
}