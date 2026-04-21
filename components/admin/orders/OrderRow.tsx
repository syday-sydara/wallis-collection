"use client";

import Link from "next/link";
import { format } from "date-fns";

import StatusBadge from "./StatusBadge";
import PaymentBadge from "./PaymentBadge";

function formatAmount(amount: number, currency: string) {
  return `${currency} ${(amount / 100).toFixed(2)}`;
}

export default function OrderRow({ order }: { order: any }) {
  return (
    <tr className="border-t border-border-default">
      {/* Order ID */}
      <td className="p-3">
        <div className="font-medium">#{order.id.slice(0, 8)}</div>
      </td>

      {/* Customer */}
      <td className="p-3">
        <div className="font-medium">
          {order.fullName || order.user?.name || "Guest"}
        </div>
        <div className="text-xs text-text-secondary">{order.email}</div>
      </td>

      {/* Total */}
      <td className="p-3">
        {formatAmount(order.total, order.currency || "NGN")}
      </td>

      {/* Payment Status */}
      <td className="p-3">
        <PaymentBadge status={order.paymentStatus} />
      </td>

      {/* Order Status */}
      <td className="p-3">
        <StatusBadge status={order.orderStatus} />
      </td>

      {/* Created At */}
      <td className="p-3 text-text-secondary">
        {format(new Date(order.createdAt), "yyyy-MM-dd HH:mm")}
      </td>

      {/* Actions */}
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
