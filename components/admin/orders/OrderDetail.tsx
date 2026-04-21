// components/admin/orders/OrderDetail.tsx

"use client";

import { useTransition, useState } from "react";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  getNextStatuses,
  type OrderStatus,
} from "@/lib/orders/orderStatus";

export default function OrderDetail({
  order,
  auditLogs,
  notes,
  fulfillments,
}: {
  order: any;
  auditLogs: any[];
  notes: any[];
  fulfillments: any[];
}) {
  const [status, setStatus] = useState<OrderStatus>(order.orderStatus);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const nextStatuses = getNextStatuses(status);

  async function updateStatus(next: OrderStatus) {
    setError(null);

    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/orders/${order.id}/status`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: next }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data?.error ?? "Failed to update status");
          return;
        }

        setStatus(next);
      } catch (err: any) {
        setError(err?.message ?? "Network error");
      }
    });
  }

  return (
    <div className="space-y-8 p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Order #{order.id}</h1>
        <span
          className={`rounded-full px-3 py-1 text-sm font-medium ${ORDER_STATUS_COLORS[status]}`}
        >
          {ORDER_STATUS_LABELS[status]}
        </span>
      </div>

      {/* STATUS CONTROLS */}
      {nextStatuses.length > 0 && (
        <div className="rounded-lg border p-4 space-y-3">
          <p className="text-sm font-medium">Update Status</p>

          <div className="flex flex-wrap gap-2">
            {nextStatuses.map((next) => (
              <button
                key={next}
                disabled={isPending}
                onClick={() => updateStatus(next)}
                className="inline-flex items-center rounded-md border px-3 py-1 text-sm hover:bg-surface-muted disabled:opacity-50"
              >
                {ORDER_STATUS_LABELS[next]}
              </button>
            ))}
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}
        </div>
      )}

      {/* CUSTOMER INFO */}
      <section className="rounded-lg border p-4 space-y-2">
        <h2 className="font-medium">Customer</h2>
        <p className="text-sm">{order.fullName}</p>
        <p className="text-sm">{order.email}</p>
        <p className="text-sm">{order.phone}</p>
      </section>

      {/* ITEMS */}
      <section className="rounded-lg border p-4 space-y-3">
        <h2 className="font-medium">Items</h2>

        <div className="space-y-2">
          {order.items.map((item: any) => (
            <div
              key={item.id}
              className="flex items-center justify-between border-b pb-2"
            >
              <div>
                <p className="font-medium">{item.variant.product.name}</p>
                <p className="text-sm text-text-muted">
                  {item.variant.name} × {item.quantity}
                </p>
              </div>
              <p className="font-medium">₦{item.price}</p>
            </div>
          ))}
        </div>

        <p className="text-right font-semibold text-lg">
          Total: ₦{order.total}
        </p>
      </section>

      {/* PAYMENT TIMELINE */}
      <section className="rounded-lg border p-4 space-y-3">
        <h2 className="font-medium">Payment Timeline</h2>

        {order.payments.length === 0 && (
          <p className="text-sm text-text-muted">No payments yet.</p>
        )}

        <div className="space-y-3">
          {order.payments.map((p: any) => (
            <div
              key={p.id}
              className="rounded-md border p-3 bg-surface-muted space-y-1"
            >
              <p className="font-medium">
                {p.status} — {p.provider.toUpperCase()}
              </p>
              <p className="text-sm text-text-muted">
                Reference: {p.reference}
              </p>

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

              {p.fraudSignals?.length > 0 && (
                <ul className="text-xs text-text-muted list-disc ml-4">
                  {p.fraudSignals.map((s: string, i: number) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              )}

              {p.status === "CHARGEBACK" && (
                <p className="text-sm text-danger font-medium">
                  Chargeback received
                </p>
              )}

              {p.status === "REFUNDED" && (
                <p className="text-sm text-success font-medium">
                  Refunded: ₦{p.amount}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* FULFILLMENT TIMELINE */}
      <section className="rounded-lg border p-4 space-y-3">
        <h2 className="font-medium">Fulfillment</h2>

        {fulfillments.length === 0 && (
          <p className="text-sm text-text-muted">No fulfillment events.</p>
        )}

        <div className="space-y-2">
          {fulfillments.map((f: any) => (
            <div key={f.id} className="border-b pb-2">
              <p className="font-medium">{f.status}</p>
              <p className="text-sm text-text-muted">
                {new Date(f.createdAt).toLocaleString()}
              </p>
              {f.trackingNumber && (
                <p className="text-sm">Tracking: {f.trackingNumber}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* NOTES */}
      <section className="rounded-lg border p-4 space-y-3">
        <h2 className="font-medium">Notes</h2>

        {notes.length === 0 && (
          <p className="text-sm text-text-muted">No notes yet.</p>
        )}

        <div className="space-y-2">
          {notes.map((n: any) => (
            <div key={n.id} className="border-b pb-2">
              <p className="text-sm">{n.message}</p>
              <p className="text-xs text-text-muted">
                {new Date(n.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* AUDIT LOGS */}
      <section className="rounded-lg border p-4 space-y-3">
        <h2 className="font-medium">Audit Log</h2>

        {auditLogs.length === 0 && (
          <p className="text-sm text-text-muted">No audit logs.</p>
        )}

        <div className="space-y-2">
          {auditLogs.map((log: any) => (
            <div key={log.id} className="border-b pb-2">
              <p className="font-medium">{log.action}</p>
              <p className="text-sm text-text-muted">
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
