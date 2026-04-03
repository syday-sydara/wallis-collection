import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 50
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text tracking-tight">
          Orders
        </h2>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-surface-card shadow-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-surface-muted text-xs uppercase text-text-muted">
            <tr>
              <th className="py-3 px-4">Order</th>
              <th className="px-4">Customer</th>
              <th className="px-4">Amount</th>
              <th className="px-4">Payment</th>
              <th className="px-4">Fraud</th>
              <th className="px-4">Updated</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-surface-muted/50 transition-colors">
                <td className="py-3 px-4">
                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="font-medium text-text hover:underline"
                  >
                    {o.id}
                  </Link>

                  <div className="text-xs text-text-muted">
                    {o.paymentProvider ? o.paymentProvider.toUpperCase() : "—"}
                  </div>
                </td>

                <td className="px-4">
                  <div>{o.fullName ?? "—"}</div>
                  <div className="text-xs text-text-muted">{o.email ?? ""}</div>
                </td>

                <td className="px-4">
                  ₦{(o.total / 100).toLocaleString("en-NG")}
                </td>

                <td className="px-4">
                  {o.paymentStatus === "PAID" && (
                    <span className="rounded-md bg-success px-2 py-0.5 text-xs text-success-foreground">
                      Paid
                    </span>
                  )}
                  {o.paymentStatus === "PENDING" && (
                    <span className="rounded-md bg-warning px-2 py-0.5 text-xs text-warning-foreground">
                      Pending
                    </span>
                  )}
                  {o.paymentStatus === "FAILED" && (
                    <span className="rounded-md bg-danger px-2 py-0.5 text-xs text-danger-foreground">
                      Failed
                    </span>
                  )}
                  {o.paymentStatus === "REVIEW" && (
                    <span className="rounded-md bg-primary/30 px-2 py-0.5 text-xs text-text">
                      Review
                    </span>
                  )}
                </td>

                <td className="px-4">
                  {o.fraudScore == null ? (
                    <span className="text-xs text-text-muted">—</span>
                  ) : o.fraudScore < 30 ? (
                    <span className="rounded-md bg-success/30 px-2 py-0.5 text-xs text-success-foreground">
                      {o.fraudScore}
                    </span>
                  ) : o.fraudScore < 70 ? (
                    <span className="rounded-md bg-warning/40 px-2 py-0.5 text-xs text-warning-foreground">
                      {o.fraudScore}
                    </span>
                  ) : (
                    <span className="rounded-md bg-danger px-2 py-0.5 text-xs text-danger-foreground">
                      {o.fraudScore}
                    </span>
                  )}
                </td>

                <td className="px-4 text-xs text-text-muted">
                  {new Date(o.updatedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}