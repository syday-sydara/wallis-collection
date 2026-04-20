import { toAdminProductSummary } from "@/lib/products/viewModels";
import { prisma } from "@/lib/prisma";
import ProductTable from "./ProductTable";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      variants: { select: { stock: true } },
    },
  });

  const summaries = products.map(toAdminProductSummary);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Products</h1>

        <a
          href="/admin/products/new"
          className="btn btn-primary"
        >
          New Product
        </a>
      </div>

      <ProductTable products={summaries} />
    </div>
  );
}
