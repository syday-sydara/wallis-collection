"use client";

import { useTransition } from "react";
import { format } from "date-fns";
import admin from "@/lib/admin/client";
import { toast } from "@/components/admin/ui/toast/AdminToastProvider";
import { useRouter } from "next/navigation";
import OrderTimeline from "./OrderTimeline";

import {
  ORDER_STATUS_LABELS,
  getNextStatuses,
  OrderStatus,
} from "@/lib/orders/orderStatus";
import OrderNotes from "./OrderNotes";

function formatAmount(amount: number, currency: string) {
  return `${currency} ${(amount / 100).toFixed(2)}`;
}

export default function OrderDetail({
  order,
  auditLogs,
  notes,
}: {
  order: any;
  auditLogs: any[];
  notes: any[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const nextStatuses = getNextStatuses(order.orderStatus as OrderStatus);

  function updateOrderStatus(status: OrderStatus) {
    startTransition(async () => {
      try {
        await admin.orders.updateStatus(order.id, status);
        toast.success(`Order marked as ${ORDER_STATUS_LABELS[status]}`);
        router.refresh();
      } catch {
        toast.error("Failed to update status");
      }
    });
  }

  function markPaid() {
    startTransition(async () => {
      try {
        await admin.orders.markPaid(order.id);
        toast.success("Order marked as paid");
        router.refresh();
      } catch {
        toast.error("Failed to mark as paid");
      }
    });
  }

  function refund() {
    const amount = prompt("Refund amount (e.g. 1000.00):");
    if (!amount) return;

    const value = Math.round(parseFloat(amount) * 100);
    if (!value || value <= 0) return;

    startTransition(async () => {
      try {
        await admin.orders.refund(order.id, value);
        toast.success("Refund recorded");
        router.refresh();
      } catch {
        toast.error("Failed to refund");
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Order #{order.id.slice(0, 8)}
          </h1>
          <p className="text-sm text-text-secondary">
            Placed {format(new Date(order.createdAt), "yyyy-MM-dd HH:mm")}
          </p>
        </div>

        {/* Dynamic Action Bar */}
        <div className="flex flex-wrap gap-2">
          {!order.isPaid && (
            <button
              className="btn btn-outline btn-sm"
              onClick={markPaid}
              disabled={isPending}
            >
              Mark as Paid
            </button>
          )}

          {nextStatuses.map((s) => (
            <button
              key={s}
              className="btn btn-outline btn-sm"
              onClick={() => updateOrderStatus(s)}
              disabled={isPending}
            >
              Mark as {ORDER_STATUS_LABELS[s]}
            </button>
          ))}

          <button
            className="btn btn-outline btn-sm"
            onClick={refund}
            disabled={isPending}
          >
            Refund
          </button>
        </div>
      </div>

      {/* Notes */}
      <OrderNotes orderId={order.id} notes={notes} />

      {/* Timeline */}
      <OrderTimeline order={order} auditLogs={auditLogs} />
    </div>
  );
}
