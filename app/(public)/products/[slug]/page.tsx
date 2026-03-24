import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import ProductDetailView from "@/components/products/ProductDetailView";
// ... (keep existing imports and generateMetadata)

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug, deletedAt: null },
    include: { images: { orderBy: { position: "asc" } } },
  });

  if (!product) notFound();

  const formattedProduct = {
    ...product,
    priceNaira: product.price / 100,
    salePriceNaira: product.salePrice ? product.salePrice / 100 : null,
  };

  // NEW: Generate Google Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.images[0]?.url,
    "description": product.description,
    "brand": {
      "@type": "Brand",
      "name": "Wallis Collection"
    },
    "offers": {
      "@type": "Offer",
      "url": `${process.env.NEXT_PUBLIC_URL}/products/${product.slug}`,
      "priceCurrency": "NGN",
      "price": formattedProduct.salePriceNaira || formattedProduct.priceNaira,
      "itemCondition": "https://schema.org/NewCondition",
      "availability": product.stock > 0 
        ? "https://schema.org/InStock" 
        : "https://schema.org/OutOfStock"
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {/* Inject JSON-LD invisibly for search engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailView product={formattedProduct} />
    </main>
  );
}