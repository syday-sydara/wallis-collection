"use client";

import {
  PAYMENT_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
  PaymentStatus,
} from "@/lib/orders/paymentStatus";

export default function PaymentBadge({ status }: { status: PaymentStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${PAYMENT_STATUS_COLORS[status]}`}
    >
      {PAYMENT_STATUS_LABELS[status]}
    </span>
  );
}
