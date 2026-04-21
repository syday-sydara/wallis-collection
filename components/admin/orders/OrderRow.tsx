"use client";

import Link from "next/link";
import { format } from "date-fns";

function formatAmount(amount: number, currency: string) {
  return `${currency} ${(amount / 100).toFixed(2)}`;
}

export default function OrderRow({ order }: { order: any }) {
  const paymentStatus = order.paymentStatus as string;
  const orderStatus = order.orderStatus as string;

  return (
    <tr className="border-t border-border-default">
      <td className="p-3">
        <div className="font-medium">#{order.id.slice(0, 8)}</div>
      </td>

      <td className="p-3">
        <div className="font-medium">
          {order.fullName || order.user?.name || "Guest"}
        </div>
        <div className="text-xs text-text-secondary">{order.email}</div>
      </td>

      <td className="p-3">
        {formatAmount(order.total, order.currency || "NGN")}
      </td>

      <td className="p-3">
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
            paymentStatus === "SUCCESS"
              ? "bg-success/15 text-success"
              : paymentStatus === "PENDING"
              ? "bg-warning/15 text-warning"
              : paymentStatus === "FAILED"
              ? "bg-danger/15 text-danger"
              : "bg-surface-muted text-text-secondary"
          }`}
        >
          {paymentStatus}
        </span>
      </td>

      <td className="p-3">
        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-surface-muted text-text-secondary">
          {orderStatus}
        </span>
      </td>

      <td className="p-3 text-text-secondary">
        {format(new Date(order.createdAt), "yyyy-MM-dd HH:mm")}
      </td>

      <td className="p-3 text-right">
        <Link
          href={`/admin/orders/${order.id}`}
          className="btn btn-sm btn-outline"
        >
          View
        </Link>
      </td>
    </tr>
  );
}
