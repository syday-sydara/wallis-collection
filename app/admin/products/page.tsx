import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { toAdminProductSummary } from "@/lib/products/viewModels";
import ProductTable from "@/components/admin/products/ProductTable";

export const revalidate = 0; // Always fresh in admin

export default async function AdminProductsPage() {
  // Fetch minimal fields for admin list
  const products = await prisma.product.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      variants: { select: { stock: true } },
    },
  });

  const summaries = products.map(toAdminProductSummary);

  const hasProducts = summaries.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Products</h1>

        <Link href="/admin/products/new" className="btn btn-primary">
          New Product
        </Link>
      </div>

      {/* Empty State */}
      {!hasProducts && (
        <div className="rounded-lg border border-border bg-surface-card p-10 text-center space-y-3">
          <p className="text-lg font-medium">No products found</p>
          <p className="text-text-muted text-sm">
            Get started by creating your first product.
          </p>

          <Link href="/admin/products/new" className="btn btn-primary mt-4">
            Create Product
          </Link>
        </div>
      )}

      {/* Product Table */}
      {hasProducts && <ProductTable products={summaries} />}
    </div>
  );
}
