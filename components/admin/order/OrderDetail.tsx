"use client";

import { useTransition } from "react";
import { format } from "date-fns";
import admin from "@/lib/admin/client";
import { toast } from "@/components/admin/ui/toast/AdminToastProvider";
import { useRouter } from "next/navigation";

function formatAmount(amount: number, currency: string) {
  return `${currency} ${(amount / 100).toFixed(2)}`;
}

export default function OrderDetail({ order }: { order: any }) {
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

        <div className="flex gap-2">
          <button
            className="btn btn-outline"
            onClick={markPaid}
            disabled={isPending}
          >
            Mark as Paid
          </button>

          <button
            className="btn btn-outline"
            onClick={() => updateOrderStatus("SHIPPED")}
            disabled={isPending}
          >
            Mark as Shipped
          </button>

          <button
            className="btn btn-outline"
            onClick={() => updateOrderStatus("DELIVERED")}
            disabled={isPending}
          >
            Mark as Delivered
          </button>

          <button
            className="btn btn-danger"
            onClick={() => updateOrderStatus("CANCELLED")}
            disabled={isPending}
          >
            Cancel Order
          </button>

          <button
            className="btn btn-outline"
            onClick={refund}
            disabled={isPending}
          >
            Refund
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="border border-border-default rounded-md p-4 space-y-2">
          <h2 className="font-medium text-sm">Customer</h2>
          <div className="text-sm">
            <div>{order.fullName}</div>
            <div className="text-text-secondary">{order.email}</div>
            <div className="text-text-secondary">{order.phone}</div>
          </div>
        </div>

        <div className="border border-border-default rounded-md p-4 space-y-2">
          <h2 className="font-medium text-sm">Payment</h2>
          <div className="text-sm space-y-1">
            <div>Status: {order.paymentStatus}</div>
            <div>Method: {order.paymentMethod}</div>
            <div>Provider: {order.paymentProvider || "—"}</div>
            <div>Is Paid: {order.isPaid ? "Yes" : "No"}</div>
          </div>
        </div>

        <div className="border border-border-default rounded-md p-4 space-y-2">
          <h2 className="font-medium text-sm">Totals</h2>
          <div className="text-sm space-y-1">
            <div>
              Subtotal: {formatAmount(order.subtotal, order.currency || "NGN")}
            </div>
            <div>
              Shipping: {formatAmount(order.shippingCost, order.currency || "NGN")}
            </div>
            <div>
              Discount: -{formatAmount(order.discountAmount, order.currency || "NGN")}
            </div>
            <div className="font-semibold">
              Total: {formatAmount(order.total, order.currency || "NGN")}
            </div>
            {order.refundedAmount > 0 && (
              <div className="text-danger">
                Refunded: {formatAmount(order.refundedAmount, order.currency || "NGN")}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="border border-border-default rounded-md">
        <div className="border-b border-border-default px-4 py-2 font-medium text-sm">
          Items
        </div>
        <div className="divide-y">
          {order.items.map((item: any) => (
            <div key={item.id} className="px-4 py-3 flex justify-between text-sm">
              <div>
                <div className="font-medium">{item.name}</div>
                <div className="text-text-secondary text-xs">
                  {item.variant?.product?.name} · {item.variant?.sku}
                </div>
                {item.attributes && (
                  <div className="text-xs text-text-secondary">
                    {JSON.stringify(item.attributes)}
                  </div>
                )}
              </div>
              <div className="text-right">
                <div>
                  {formatAmount(item.unitPrice, order.currency || "NGN")} ×{" "}
                  {item.quantity}
                </div>
                <div className="font-medium">
                  {formatAmount(
                    item.unitPrice * item.quantity,
                    order.currency || "NGN"
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shipping */}
      <div className="border border-border-default rounded-md p-4 space-y-2">
        <h2 className="font-medium text-sm">Shipping</h2>
        <div className="text-sm space-y-1">
          <div>Type: {order.shippingType}</div>
          <div className="text-text-secondary text-xs">
            {JSON.stringify(order.shippingAddress)}
          </div>
          {order.deliveryNotes && (
            <div className="text-xs text-text-secondary">
              Notes: {order.deliveryNotes}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
