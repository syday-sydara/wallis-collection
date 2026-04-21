import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { toAdminProductSummary } from "@/lib/products/viewModels";
import ProductTable from "./ProductTable";

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Products</h1>

        <Link href="/admin/products/new" className="btn btn-primary">
          New Product
        </Link>
      </div>

      {/* Product Table */}
      <ProductTable products={summaries} />
    </div>
  );
}
