import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import ProductDetailView from "@/components/products/ProductDetailView";
import { Metadata } from "next";

interface Props {
  params: { slug: string };
}

export const revalidate = 300;

const getProduct = async (slug: string) => {
  return prisma.product.findFirst({
    where: {
      slug,
      deletedAt: null,
    },
    include: {
      images: {
        take: 3,
        orderBy: { position: "asc" },
        select: { url: true },
      },
    },
  });
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct(params.slug);

  if (!product) return { title: "Product Not Found" };

  const imageUrl = product.images?.[0]?.url || "/fallback-product.jpg";

  return {
    title: `${product.name} | Wallis Collection`,
    description:
      product.description || "View product details and pricing",
    openGraph: {
      images: [imageUrl],
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const product = await getProduct(params.slug);

  if (!product) notFound();

  return (
    <main className="max-w-7xl mx-auto px-4 py-4 md:py-8">
      <ProductDetailView product={product} />
    </main>
  );
}