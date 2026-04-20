import { prisma } from "@/lib/prisma";
import { toAdminProductSummary } from "@/lib/products/viewModels";
import ProductTable from "./ProductTable";

export default async function AdminProductsPage() {
  // Fetch products with minimal fields needed for the admin list
  const products = await prisma.product.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      variants: { select: { stock: true } },
    },
  });

  // Convert raw DB results → Admin-friendly view models
  const summaries = products.map(toAdminProductSummary);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Products</h1>

        <a
          href="/admin/products/new"
          className="btn btn-primary"
        >
          New Product
        </a>
      </div>

      {/* Product Table */}
      <ProductTable products={summaries} />
    </div>
  );
}
