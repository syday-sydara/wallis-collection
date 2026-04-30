// app/admin/orders/page.tsx

import { prisma } from "@/lib/prisma";
import OrderTable from "@/components/admin/orders/OrderTable";
import OrderFilters from "@/components/admin/orders/OrderFilters";

type SearchParams = {
  status?: string;
  paymentStatus?: string;
  q?: string;
};

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { status, paymentStatus, q } = searchParams;

  const where: any = {};

  // -----------------------------
  // ORDER STATUS FILTER
  // -----------------------------
  if (status && status !== "ALL") {
    where.orderStatus = status;
  }

  // -----------------------------
  // PAYMENT STATUS FILTER
  // -----------------------------
  if (paymentStatus && paymentStatus !== "ALL") {
    where.payments = {
      some: {
        status: paymentStatus,
      },
    };
  }

  // -----------------------------
  // SEARCH FILTER
  // -----------------------------
  if (q) {
    where.OR = [
      { email: { contains: q, mode: "insensitive" } },
      { phone: { contains: q, mode: "insensitive" } },
      { fullName: { contains: q, mode: "insensitive" } },
      { id: { contains: q } },
    ];
  }

  // -----------------------------
  // QUERY ORDERS
  // -----------------------------
  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      items: true,
      payments: true,
    },
    take: 50,
  });

  const hasResults = orders.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">Orders</h1>
        <p className="text-sm text-text-muted">
          View and manage all customer orders across the platform.
        </p>
      </div>

      {/* Filters */}
      <OrderFilters
        initialStatus={status}
        initialPaymentStatus={paymentStatus}
        initialQuery={q}
      />

      {/* Results */}
      {hasResults ? (
        <OrderTable orders={orders} />
      ) : (
        <div className="rounded-lg border border-border bg-surface-card p-10 text-center space-y-3">
          <p className="text-lg font-medium">No orders found</p>
          <p className="text-text-muted text-sm">
            Try adjusting your filters or search query.
          </p>
        </div>
      )}
    </div>
  );
}
