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

  if (status && status !== "ALL") {
    where.orderStatus = status;
  }

  if (paymentStatus && paymentStatus !== "ALL") {
    where.paymentStatus = paymentStatus;
  }

  if (q) {
    where.OR = [
      { email: { contains: q, mode: "insensitive" } },
      { phone: { contains: q, mode: "insensitive" } },
      { fullName: { contains: q, mode: "insensitive" } },
      { id: { contains: q } },
    ];
  }

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Orders</h1>
      </div>

      <OrderFilters initialStatus={status} initialPaymentStatus={paymentStatus} initialQuery={q} />

      <OrderTable orders={orders} />
    </div>
  );
}
