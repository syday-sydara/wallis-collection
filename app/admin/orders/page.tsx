import { prisma } from "@/lib/prisma";
import OrderTable from "@/components/admin/orders/OrderTable";

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({
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

      <OrderTable orders={orders} />
    </div>
  );
}
