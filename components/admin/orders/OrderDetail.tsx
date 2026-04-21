"use client";

import { useTransition } from "react";
import { format } from "date-fns";
import admin from "@/lib/admin/client";
import { toast } from "@/components/admin/ui/toast/AdminToastProvider";
import { useRouter } from "next/navigation";
import OrderTimeline from "./OrderTimeline";

function formatAmount(amount: number, currency: string) {
  return `${currency} ${(amount / 100).toFixed(2)}`;
}

export default function OrderDetail({
  order,
  auditLogs,
}: {
  order: any;
  auditLogs: any[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function updateOrderStatus(status: string) {
    startTransition(async () => {
      try {
        await admin.orders.updateStatus(order.id, status);
        toast.success("Order status updated");
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
    const amount = prompt("Refund amount (in major units, e.g. 1000.00):");
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

        <div className="flex flex-wrap gap-2">
          <button
            className="btn btn-outline btn-sm"
            onClick={markPaid}
            disabled={isPending}
          >
            Mark as Paid
          </button>

          <button
            className="btn btn-outline btn-sm"
            onClick={() => updateOrderStatus("SHIPPED")}
            disabled={isPending}
          >
            Mark as Shipped
          </button>

          <button
            className="btn btn-outline btn-sm"
            onClick={() => updateOrderStatus("DELIVERED")}
            disabled={isPending}
          >
            Mark as Delivered
          </button>

          <button
            className="btn btn-danger btn-sm"
            onClick={() => updateOrderStatus("CANCELLED")}
            disabled={isPending}
          >
            Cancel Order
          </button>

          <button
            className="btn btn-outline btn-sm"
            onClick={refund}
            disabled={isPending}
          >
            Refund
          </button>
        </div>
      </div>

      {/* Summary cards (unchanged from before, trimmed for brevity) */}
      {/* ... keep your existing summary, items, shipping sections ... */}

      {/* Timeline */}
      <OrderTimeline order={order} auditLogs={auditLogs} />
    </div>
  );
}
