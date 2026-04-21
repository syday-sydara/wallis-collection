// components/admin/customers/CustomerProfile.tsx

"use client";

import Link from "next/link";

export default function CustomerProfile({ customer, orders, payments, auditLogs }) {
  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);
  const chargebacks = payments.filter((p) => p.status === "CHARGEBACK").length;
  const refunds = payments.filter((p) => p.status === "REFUNDED").length;
  const highRiskPayments = payments.filter((p) => p.fraudScore > 60).length;

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">
          {customer.fullName || "Customer"} ({customer.email})
        </h1>
      </div>

      {/* Summary Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <h2 className="text-sm text-text-secondary">Lifetime Value</h2>
          <p className="text-2xl font-semibold">₦{totalSpent}</p>
        </div>

        <div className="card">
          <h2 className="text-sm text-text-secondary">Orders</h2>
          <p className="text-2xl font-semibold">{orders.length}</p>
        </div>

        <div className="card">
          <h2 className="text-sm text-text-secondary">Chargebacks</h2>
          <p className="text-2xl font-semibold text-danger">{chargebacks}</p>
        </div>

        <div className="card">
          <h2 className="text-sm text-text-secondary">High-Risk Payments</h2>
          <p className="text-2xl font-semibold text-orange-500">{highRiskPayments}</p>
        </div>
      </section>

      {/* Orders */}
      <section className="rounded-lg border p-4 space-y-3">
        <h2 className="font-medium">Order History</h2>

        {orders.length === 0 && <p className="text-sm text-text-muted">No orders yet.</p>}

        <div className="space-y-2">
          {orders.map((o) => (
            <Link
              key={o.id}
              href={`/admin/orders/${o.id}`}
              className="block border rounded p-3 hover:bg-surface-muted"
            >
              <div className="flex justify-between">
                <p className="font-medium">Order #{o.id}</p>
                <p className="text-sm">₦{o.total}</p>
              </div>
              <p className="text-xs text-text-muted">
                {new Date(o.createdAt).toLocaleString()}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Payments */}
      <section className="rounded-lg border p-4 space-y-3">
        <h2 className="font-medium">Payment History</h2>

        {payments.length === 0 && <p className="text-sm text-text-muted">No payments yet.</p>}

        <div className="space-y-2">
          {payments.map((p) => (
            <div key={p.id} className="border rounded p-3">
              <p className="font-medium">
                {p.status} — {p.provider.toUpperCase()}
              </p>
              <p className="text-sm text-text-muted">Ref: {p.reference}</p>
              {p.fraudScore != null && (
                <p className="text-sm">
                  Fraud Score:{" "}
                  <span
                    className={
                      p.fraudScore > 70
                        ? "text-danger"
                        : p.fraudScore > 40
                        ? "text-warning"
                        : "text-success"
                    }
                  >
                    {p.fraudScore}
                  </span>
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Audit Logs */}
      <section className="rounded-lg border p-4 space-y-3">
        <h2 className="font-medium">Audit Log</h2>

        {auditLogs.length === 0 && <p className="text-sm text-text-muted">No logs.</p>}

        <div className="space-y-2">
          {auditLogs.map((log) => (
            <div key={log.id} className="border-b pb-2">
              <p className="font-medium">{log.action}</p>
              <p className="text-xs text-text-muted">
                {new Date(log.createdAt).toLocaleString()}
              </p>
              {log.metadata && (
                <pre className="text-xs bg-surface-muted p-2 rounded">
                  {JSON.stringify(log.metadata, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
