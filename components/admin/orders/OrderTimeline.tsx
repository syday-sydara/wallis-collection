"use client";

import { format } from "date-fns";

type TimelineEvent = {
  id: string;
  type: string;
  label: string;
  at: Date;
  meta?: any;
};

export default function OrderTimeline({
  order,
  auditLogs,
}: {
  order: any;
  auditLogs: any[];
}) {
  const events: TimelineEvent[] = [];

  // Order created
  events.push({
    id: `created-${order.id}`,
    type: "ORDER_CREATED",
    label: "Order created",
    at: new Date(order.createdAt),
  });

  // Payments
  for (const p of order.payments || []) {
    events.push({
      id: `payment-${p.id}`,
      type: "PAYMENT",
      label: `Payment ${p.status} (${p.provider || "Unknown"})`,
      at: new Date(p.createdAt),
      meta: {
        amount: p.amount,
        currency: p.currency,
        reference: p.reference,
      },
    });

    if (p.paidAt) {
      events.push({
        id: `payment-paid-${p.id}`,
        type: "PAYMENT_PAID",
        label: "Payment marked as paid",
        at: new Date(p.paidAt),
      });
    }
  }

  // Refunds (from order.refundedAmount changes via AuditLog)
  for (const log of auditLogs) {
    if (log.action === "ORDER_REFUND") {
      events.push({
        id: `refund-${log.id}`,
        type: "REFUND",
        label: "Refund recorded",
        at: new Date(log.createdAt),
        meta: log.metadata,
      });
    }
  }

  // Status changes
  for (const log of auditLogs) {
    if (log.action === "ORDER_STATUS_CHANGED") {
      events.push({
        id: `status-${log.id}`,
        type: "STATUS",
        label: `Status changed to ${log.metadata?.to}`,
        at: new Date(log.createdAt),
      });
    }
  }

  // Sort by time
  events.sort((a, b) => a.at.getTime() - b.at.getTime());

  if (!events.length) {
    return null;
  }

  return (
    <div className="border border-border-default rounded-md p-4 space-y-3">
      <h2 className="font-medium text-sm">Timeline</h2>

      <ol className="space-y-3 text-sm">
        {events.map((e) => (
          <li key={e.id} className="flex gap-3">
            <div className="mt-1 h-2 w-2 rounded-full bg-[rgb(var(--color-primary))]" />
            <div>
              <div className="font-medium">{e.label}</div>
              <div className="text-xs text-text-secondary">
                {format(e.at, "yyyy-MM-dd HH:mm")}
              </div>
              {e.type === "PAYMENT" && e.meta && (
                <div className="text-xs text-text-secondary mt-1">
                  {e.meta.currency} {(e.meta.amount / 100).toFixed(2)} · Ref:{" "}
                  {e.meta.reference}
                </div>
              )}
              {e.type === "REFUND" && e.meta && (
                <div className="text-xs text-text-secondary mt-1">
                  Refunded: {e.meta.amount && (e.meta.amount / 100).toFixed(2)}
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
