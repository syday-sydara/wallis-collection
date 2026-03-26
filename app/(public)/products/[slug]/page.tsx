import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import ProductDetailView from "@/components/products/ProductDetailView";

interface ProductPageProps {
  params: { slug: string };
}

export default async function ProductPage({ params }: ProductPageProps) {
  // Fetch product with images
  const product = await prisma.product.findUnique({
    where: { slug: params.slug, deletedAt: null },
    include: { images: { orderBy: { position: "asc" } } },
  });

  if (!product) notFound();

  // Format prices in Naira
  const formattedProduct = {
    ...product,
    priceNaira: product.price / 100,
    salePriceNaira: product.salePrice ? product.salePrice / 100 : null,
  };

  // Structured Data for SEO (JSON-LD)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images.map((img) => img.url),
    description: product.description,
    brand: {
      "@type": "Brand",
      name: "Wallis Collection",
    },
    offers: {
      "@type": "Offer",
      url: `${process.env.NEXT_PUBLIC_URL}/products/${product.slug}`,
      priceCurrency: "NGN",
      price: formattedProduct.salePriceNaira || formattedProduct.priceNaira,
      itemCondition: "https://schema.org/NewCondition",
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {/* Inject JSON-LD invisibly for search engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Product detail component */}
      <ProductDetailView product={formattedProduct} />
    </main>
  );
}