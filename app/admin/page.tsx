import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminCard } from "@/components/admin/ui/AdminCard";

export default async function AdminHomePage() {
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
    prisma.payment.count({ where: { status: "CHARGEBACK" } }),
    prisma.payment.count({ where: { status: "REFUNDED" } }),
    prisma.payment.count({ where: { status: "REVIEW" } }),
  ]);

  return (
    <div className="space-y-10 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Admin Dashboard</h1>
      </div>

      {/* Quick Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminCard as={Link} href="/admin/orders" header="Orders" hover>
          <p className="text-text-secondary text-sm">Total orders in the system</p>
          <p className="mt-4 text-2xl font-semibold">{orderCount}</p>
        </AdminCard>

        <AdminCard
          as={Link}
          href="/admin/orders?status=REVIEW"
          header="Fraud Review"
          hover
        >
          <p className="text-text-secondary text-sm">
            Payments flagged for manual review
          </p>
          <p className="mt-4 text-2xl font-semibold text-orange-500">
            {fraudQueue}
          </p>
        </AdminCard>

        <AdminCard
          as={Link}
          href="/admin/payments?status=CHARGEBACK"
          header="Chargebacks"
          hover
        >
          <p className="text-text-secondary text-sm">
            Payments reversed by banks
          </p>
          <p className="mt-4 text-2xl font-semibold text-red-500">
            {chargebacks}
          </p>
        </AdminCard>

        <AdminCard
          as={Link}
          href="/admin/payments?status=REFUNDED"
          header="Refunds"
          hover
        >
          <p className="text-text-secondary text-sm">
            Completed customer refunds
          </p>
          <p className="mt-4 text-2xl font-semibold text-green-600">
            {refunds}
          </p>
        </AdminCard>
      </section>

      {/* Order Status Breakdown */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <AdminCard
          as={Link}
          href="/admin/orders?status=PENDING_PAYMENT"
          header="Pending Payment"
          hover
        >
          <p className="text-text-secondary text-sm">
            Orders awaiting payment confirmation
          </p>
          <p className="mt-4 text-2xl font-semibold">{pendingOrders}</p>
        </AdminCard>

        <AdminCard
          as={Link}
          href="/admin/orders?status=SHIPPED"
          header="Shipped"
          hover
        >
          <p className="text-text-secondary text-sm">
            Orders currently in transit
          </p>
          <p className="mt-4 text-2xl font-semibold">{shippedOrders}</p>
        </AdminCard>

        <AdminCard
          as={Link}
          href="/admin/orders?status=DELIVERED"
          header="Delivered"
          hover
        >
          <p className="text-text-secondary text-sm">
            Orders successfully delivered
          </p>
          <p className="mt-4 text-2xl font-semibold">{deliveredOrders}</p>
        </AdminCard>

        <AdminCard
          as={Link}
          href="/admin/orders?status=CANCELLED"
          header="Cancelled"
          hover
        >
          <p className="text-text-secondary text-sm">
            Orders cancelled by system or admin
          </p>
          <p className="mt-4 text-2xl font-semibold">{cancelledOrders}</p>
        </AdminCard>
      </section>

      {/* Product Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <AdminCard as={Link} href="/admin/products" header="Products" hover>
          <p className="text-text-secondary text-sm">
            Manage all products in your catalog
          </p>
          <p className="mt-4 text-2xl font-semibold">{productCount}</p>
        </AdminCard>

        <AdminCard as={Link} href="/admin/products" header="Variants" hover>
          <p className="text-text-secondary text-sm">
            Total product variants in the system
          </p>
          <p className="mt-4 text-2xl font-semibold">{variantCount}</p>
        </AdminCard>

        <AdminCard header="Coming Soon">
          <p className="text-text-secondary text-sm">
            Customers, analytics, and more
          </p>
        </AdminCard>
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
