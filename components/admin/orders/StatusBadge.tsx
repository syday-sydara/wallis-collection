"use client";

import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS, OrderStatus } from "@/lib/orders/orderStatus";

export default function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${ORDER_STATUS_COLORS[status]}`}
    >
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}
