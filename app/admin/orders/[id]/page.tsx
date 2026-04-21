import { prisma } from "@/lib/prisma";
import OrderDetail from "@/components/admin/orders/OrderDetail";

export default async function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      user: true,
      items: {
        include: {
          variant: {
            include: { product: true },
          },
        },
      },
      payments: true,
    },
  });

  if (!order) {
    return <div className="p-6">Order not found.</div>;
  }

  const auditLogs = await prisma.auditLog.findMany({
    where: {
      resource: "order",
      resourceId: order.id,
    },
    orderBy: { createdAt: "asc" },
  });

  const notes = await prisma.auditLog.findMany({
    where: {
      resource: "order",
      resourceId: params.id,
      action: "ORDER_NOTE",
    },
    orderBy: { createdAt: "desc" },
  });

  const fulfillments = await prisma.fulfillment.findMany({
    where: { orderId: params.id },
    orderBy: { createdAt: "asc" },
  });

  return (
    <OrderDetail
      order={order}
      auditLogs={auditLogs}
      notes={notes}
      fulfillments={fulfillments}
    />
  );
}
