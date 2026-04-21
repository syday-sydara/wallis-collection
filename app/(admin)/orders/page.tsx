// app/(admin)/orders/page.tsx

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
  // (works with payments[] relation)
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
      payments: true, // updated relation
    },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Orders</h1>
      </div>

      <OrderFilters
        initialStatus={status}
        initialPaymentStatus={paymentStatus}
        initialQuery={q}
      />

      <OrderTable orders={orders} />
    </div>
  );
}
