import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminHomePage() {
  // Fetch lightweight counts for dashboard cards
  const [productCount, variantCount] = await Promise.all([
    prisma.product.count(),
    prisma.productVariant.count(),
  ]);

  return (
    <div className="space-y-10 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">
          Admin Dashboard
        </h1>
      </div>

      {/* Quick Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Products */}
        <Link href="/admin/products" className="card hover:shadow-md transition">
          <h2 className="text-lg font-medium mb-2">Products</h2>
          <p className="text-text-secondary text-sm">
            Manage all products in your catalog.
          </p>
          <p className="mt-4 text-2xl font-semibold">{productCount}</p>
        </Link>

        {/* Variants */}
        <div className="card">
          <h2 className="text-lg font-medium mb-2">Variants</h2>
          <p className="text-text-secondary text-sm">
            Total product variants in the system.
          </p>
          <p className="mt-4 text-2xl font-semibold">{variantCount}</p>
        </div>

        {/* Placeholder for future features */}
        <div className="card">
          <h2 className="text-lg font-medium mb-2">Coming Soon</h2>
          <p className="text-text-secondary text-sm">
            Orders, customers, analytics, and more.
          </p>
        </div>
      </section>

      {/* Helpful Links */}
      <section className="space-y-4">
        <h2 className="text-lg font-medium">Quick Actions</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/admin/products/new" className="btn btn-primary">
            Create New Product
          </Link>

          <Link href="/admin/products" className="btn btn-outline">
            View All Products
          </Link>
        </div>
      </section>
    </div>
  );
}
