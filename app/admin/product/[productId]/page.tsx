import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProductTabs from "@/components/admin/products/ProductTabs";

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      images: true,
      variants: true,
    },
  });

  if (!product) {
    return (
      <div className="p-6 text-center space-y-3">
        <h2 className="text-lg font-medium">Product not found</h2>
        <p className="text-text-muted text-sm">This product may have been deleted.</p>
        <Link href="/admin/products" className="btn btn-primary mt-2">
          Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-text-muted">
        <Link href="/admin/products" className="hover:underline">
          Products
        </Link>
        <span className="mx-1">/</span>
        <span className="text-text">{product.name}</span>
      </nav>

      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">{product.name}</h1>
        <p className="text-sm text-text-muted">
          Last updated {new Date(product.updatedAt).toLocaleDateString("en-US")}
        </p>
      </div>

      {/* Tabs */}
      <div className="rounded-lg border border-border bg-surface-card p-4 shadow-sm">
        <ProductTabs product={product} />
      </div>
    </div>
  );
}
