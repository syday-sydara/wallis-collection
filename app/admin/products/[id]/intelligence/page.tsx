import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ProductIntelligence from "@/components/admin/products/_components/ProductIntelligence";
import { notFound } from "next/navigation";

export const revalidate = 0;

type Props = {
  params: { id: string };
};

export default async function ProductIntelligencePage({ params }: Props) {
  const productId = params.id;

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { variants: true },
  });

  if (!product) {
    return (
      <div className="p-10 text-center space-y-3">
        <h2 className="text-lg font-medium">Product not found</h2>
        <Link href="/admin/products" className="btn btn-primary mt-2">
          Back to Products
        </Link>
      </div>
    );
  }

  // Ensure insights row exists
  const insights =
    (await prisma.productInsights.findUnique({
      where: { productId },
    })) ??
    (await prisma.productInsights.create({
      data: { productId },
    }));

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-text-muted">
        <Link href="/admin/products" className="hover:underline">
          Products
        </Link>
        <span className="mx-1">/</span>
        <Link href={`/admin/products/${product.id}`} className="hover:underline">
          {product.name}
        </Link>
        <span className="mx-1">/</span>
        <span className="text-text">Intelligence</span>
      </nav>

      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">
          Intelligence — {product.name}
        </h1>
        <p className="text-sm text-text-muted">
          Behavioral insights, conversion signals, and variant performance.
        </p>
      </div>

      <ProductIntelligence
        product={product}
        insights={{
          ...insights,
          variantPopularity: (insights.variantPopularity as any) ?? {},
        }}
      />
    </div>
  );
}
