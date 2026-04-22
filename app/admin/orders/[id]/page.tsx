// app/admin/orders/[id]/page.tsx

import { prisma } from "@/lib/prisma";
import OrderDetail from "@/components/admin/orders/OrderDetail";

export default async function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const orderId = params.id;

  // -----------------------------
  // Load order + related data
  // -----------------------------
  const orderPromise = prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: true,
      items: {
        include: {
          variant: {
            include: { product: true },
          },
        },
      },
      payments: true, // updated relation
    },
  });

  const auditLogsPromise = prisma.auditLog.findMany({
    where: {
      resource: "order",
      resourceId: orderId,
    },
    orderBy: { createdAt: "asc" },
  });

  const notesPromise = prisma.auditLog.findMany({
    where: {
      resource: "order",
      resourceId: orderId,
      action: "ORDER_NOTE",
    },
    orderBy: { createdAt: "desc" },
  });

  const fulfillmentsPromise = prisma.fulfillment.findMany({
    where: { orderId },
    orderBy: { createdAt: "asc" },
  });

  // Run queries in parallel for speed
  const [order, auditLogs, notes, fulfillments] = await Promise.all([
    orderPromise,
    auditLogsPromise,
    notesPromise,
    fulfillmentsPromise,
  ]);

  // -----------------------------
  // Handle missing order
  // -----------------------------
  if (!order) {
    return <div className="p-6">Order not found.</div>;
  }

  // -----------------------------
  // Render detail component
  // -----------------------------
  return (
    <OrderDetail
      order={order}
      auditLogs={auditLogs}
      notes={notes}
      fulfillments={fulfillments}
    />
  );
}
