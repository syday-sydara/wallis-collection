// app/(admin)/page.tsx

import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminHomePage() {
  // Fetch dashboard metrics in parallel
  const [
    productCount,
    variantCount,
    orderCount,
    pendingOrders,
    reviewOrders,
    shippedOrders,
    deliveredOrders,
    cancelledOrders,
    chargebacks,
    refunds,
    fraudQueue,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.productVariant.count(),
    prisma.order.count(),
    prisma.order.count({ where: { orderStatus: "PENDING_PAYMENT" } }),
    prisma.order.count({ where: { orderStatus: "REVIEW" } }),
    prisma.order.count({ where: { orderStatus: "SHIPPED" } }),
    prisma.order.count({ where: { orderStatus: "DELIVERED" } }),
    prisma.order.count({ where: { orderStatus: "CANCELLED" } }),

    // Payment-level metrics
    prisma.payment.count({ where: { status: "CHARGEBACK" } }),
    prisma.payment.count({ where: { status: "REFUNDED" } }),

    // Fraud queue = payments in REVIEW
    prisma.payment.count({ where: { status: "REVIEW" } }),
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
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Orders */}
        <Link href="/admin/orders" className="card hover:shadow-md transition">
          <h2 className="text-lg font-medium mb-2">Orders</h2>
          <p className="text-text-secondary text-sm">
            Total orders in the system.
          </p>
          <p className="mt-4 text-2xl font-semibold">{orderCount}</p>
        </Link>

        {/* Fraud Review Queue */}
        <Link
          href="/admin/orders?status=REVIEW"
          className="card hover:shadow-md transition"
        >
          <h2 className="text-lg font-medium mb-2">Fraud Review</h2>
          <p className="text-text-secondary text-sm">
            Payments flagged for manual review.
          </p>
          <p className="mt-4 text-2xl font-semibold text-orange-500">
            {fraudQueue}
          </p>
        </Link>

        {/* Chargebacks */}
        <Link
          href="/admin/payments?status=CHARGEBACK"
          className="card hover:shadow-md transition"
        >
          <h2 className="text-lg font-medium mb-2">Chargebacks</h2>
          <p className="text-text-secondary text-sm">
            Payments reversed by banks.
          </p>
          <p className="mt-4 text-2xl font-semibold text-red-500">
            {chargebacks}
          </p>
        </Link>

        {/* Refunds */}
        <Link
          href="/admin/payments?status=REFUNDED"
          className="card hover:shadow-md transition"
        >
          <h2 className="text-lg font-medium mb-2">Refunds</h2>
          <p className="text-text-secondary text-sm">
            Completed customer refunds.
          </p>
          <p className="mt-4 text-2xl font-semibold text-green-600">
            {refunds}
          </p>
        </Link>
      </section>

      {/* Order Status Breakdown */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/admin/orders?status=PENDING_PAYMENT" className="card">
          <h2 className="text-lg font-medium mb-2">Pending Payment</h2>
          <p className="text-text-secondary text-sm">
            Orders awaiting payment confirmation.
          </p>
          <p className="mt-4 text-2xl font-semibold">{pendingOrders}</p>
        </Link>

        <Link href="/admin/orders?status=SHIPPED" className="card">
          <h2 className="text-lg font-medium mb-2">Shipped</h2>
          <p className="text-text-secondary text-sm">
            Orders currently in transit.
          </p>
          <p className="mt-4 text-2xl font-semibold">{shippedOrders}</p>
        </Link>

        <Link href="/admin/orders?status=DELIVERED" className="card">
          <h2 className="text-lg font-medium mb-2">Delivered</h2>
          <p className="text-text-secondary text-sm">
            Orders successfully delivered.
          </p>
          <p className="mt-4 text-2xl font-semibold">{deliveredOrders}</p>
        </Link>

        <Link href="/admin/orders?status=CANCELLED" className="card">
          <h2 className="text-lg font-medium mb-2">Cancelled</h2>
          <p className="text-text-secondary text-sm">
            Orders cancelled by system or admin.
          </p>
          <p className="mt-4 text-2xl font-semibold">{cancelledOrders}</p>
        </Link>
      </section>

      {/* Product Stats */}
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
        <Link href="/admin/products" className="card hover:shadow-md transition">
          <h2 className="text-lg font-medium mb-2">Variants</h2>
          <p className="text-text-secondary text-sm">
            Total product variants in the system.
          </p>
          <p className="mt-4 text-2xl font-semibold">{variantCount}</p>
        </Link>

        {/* Coming Soon */}
        <div className="card">
          <h2 className="text-lg font-medium mb-2">Coming Soon</h2>
          <p className="text-text-secondary text-sm">
            Customers, analytics, and more.
          </p>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="space-y-4">
        <h2 className="text-lg font-medium">Quick Actions</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/admin/products/new" className="btn btn-primary">
            Create New Product
          </Link>

          <Link href="/admin/orders" className="btn btn-outline">
            View All Orders
          </Link>
        </div>
      </section>
    </div>
  );
}
