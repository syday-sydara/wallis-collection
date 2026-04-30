// app/admin/orders/[id]/page.tsx

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import OrderDetail from "@/components/admin/orders/OrderDetail";

export default async function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const orderId = params.id;

  // Load order + related data in parallel
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
      payments: true,
    },
  });

  const auditLogsPromise = prisma.auditLog.findMany({
    where: { resource: "order", resourceId: orderId },
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

  const [order, auditLogs, notes, fulfillments] = await Promise.all([
    orderPromise,
    auditLogsPromise,
    notesPromise,
    fulfillmentsPromise,
  ]);

  if (!order) {
    return (
      <div className="p-10 text-center space-y-3">
        <h2 className="text-lg font-medium">Order not found</h2>
        <p className="text-text-muted text-sm">
          This order may have been deleted or never existed.
        </p>
        <Link href="/admin/orders" className="btn btn-primary mt-2">
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-text-muted">
        <Link href="/admin/orders" className="hover:underline">
          Orders
        </Link>
        <span className="mx-1">/</span>
        <span className="text-text">{order.id}</span>
      </nav>

      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">
          Order #{order.id}
        </h1>
        <p className="text-sm text-text-muted">
          Placed {new Date(order.createdAt).toLocaleString()}
        </p>
      </div>

      {/* Main Detail Component */}
      <div className="rounded-lg border border-border bg-surface-card p-4 shadow-sm">
        <OrderDetail
          order={order}
          auditLogs={auditLogs}
          notes={notes}
          fulfillments={fulfillments}
        />
      </div>
    </div>
  );
}
