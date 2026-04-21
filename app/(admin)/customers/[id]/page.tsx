// app/(admin)/customers/[id]/page.tsx

import { prisma } from "@/lib/prisma";
import CustomerProfile from "@/components/admin/customers/CustomerProfile";

export default async function CustomerProfilePage({ params }: { params: { id: string } }) {
  const customerId = params.id;

  const [customer, orders, payments, auditLogs] = await Promise.all([
    prisma.user.findUnique({
      where: { id: customerId },
    }),

    prisma.order.findMany({
      where: { userId: customerId },
      include: {
        items: true,
        payments: true,
      },
      orderBy: { createdAt: "desc" },
    }),

    prisma.payment.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
    }),

    prisma.auditLog.findMany({
      where: { resource: "customer", resourceId: customerId },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!customer) {
    return <div className="p-6">Customer not found.</div>;
  }

  return (
    <CustomerProfile
      customer={customer}
      orders={orders}
      payments={payments}
      auditLogs={auditLogs}
    />
  );
}
