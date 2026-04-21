// app/(admin)/orders/[id]/OrderStatusCard.tsx
"use client";

import { useTransition, useState } from "react";
import type { OrderStatus } from "@/lib/orders/orderStatus";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  getNextStatuses,
} from "@/lib/orders/orderStatus";

type Props = {
  orderId: string;
  currentStatus: OrderStatus;
};

export function OrderStatusCard({ orderId, currentStatus }: Props) {
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const nextStatuses = getNextStatuses(status);

  async function updateStatus(next: OrderStatus) {
    setError(null);

    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/orders/${orderId}/status`, {
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
    <div className="rounded-lg border bg-surface p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-text-secondary">
            Order Status
          </p>
          <p
            className={`inline-flex mt-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${ORDER_STATUS_COLORS[status]}`}
          >
            {ORDER_STATUS_LABELS[status]}
          </p>
        </div>
        {isPending && (
          <span className="text-xs text-text-muted">Updating…</span>
        )}
      </div>

      {nextStatuses.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs text-text-muted">Next possible statuses:</p>
          <div className="flex flex-wrap gap-2">
            {nextStatuses.map((next) => (
              <button
                key={next}
                type="button"
                disabled={isPending}
                onClick={() => updateStatus(next)}
                className="inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium hover:bg-surface-muted disabled:opacity-50"
              >
                {ORDER_STATUS_LABELS[next]}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs text-danger mt-1">
          {error}
        </p>
      )}
    </div>
  );
}
