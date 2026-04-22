import Link from "next/link";
import { prisma } from "@/lib/prisma";
import CustomerProfile from "@/components/admin/customers/CustomerProfile";

export default async function CustomerProfilePage({
  params,
}: {
  params: { id: string };
}) {
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
    return (
      <div className="p-10 text-center space-y-3">
        <h2 className="text-lg font-medium">Customer not found</h2>
        <p className="text-text-muted text-sm">
          This customer may have been deleted or never existed.
        </p>
        <Link href="/admin/customers" className="btn btn-primary mt-2">
          Back to Customers
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-text-muted">
        <Link href="/admin/customers" className="hover:underline">
          Customers
        </Link>
        <span className="mx-1">/</span>
        <span className="text-text">{customer.email ?? customer.id}</span>
      </nav>

      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">
          {customer.fullName || customer.email || "Customer"}
        </h1>

        <p className="text-sm text-text-muted">
          Joined {new Date(customer.createdAt).toLocaleDateString("en-US")}
        </p>
      </div>

      {/* Profile */}
      <div className="rounded-lg border border-border bg-surface-card p-4 shadow-sm">
        <CustomerProfile
          customer={customer}
          orders={orders}
          payments={payments}
          auditLogs={auditLogs}
        />
      </div>
    </div>
  );
}
