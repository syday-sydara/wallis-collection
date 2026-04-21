"use client";

import { format } from "date-fns";
import {
  ChatBubbleLeftRightIcon,
  ArrowPathIcon,
  CreditCardIcon,
  CheckCircleIcon,
  TruckIcon,
  ClockIcon,
  XCircleIcon,
} from "@heroicons/react/24/solid";

type TimelineEvent = {
  id: string;
  type: string;
  label: string;
  at: Date;
  meta?: any;
};

// Payment event labels
const PAYMENT_EVENT_LABELS: Record<string, string> = {
  PENDING: "Payment pending",
  SUCCESS: "Payment successful",
  FAILED: "Payment failed",
  REFUNDED: "Payment refunded",
};

// Payment event colors
const PAYMENT_EVENT_COLORS: Record<string, string> = {
  PENDING: "text-warning",
  SUCCESS: "text-success",
  FAILED: "text-danger",
  REFUNDED: "text-info",
};

// Icons for all event types
const ICONS: Record<string, any> = {
  ORDER_CREATED: ClockIcon,

  PAYMENT_INITIATED: CreditCardIcon,
  PAYMENT_PENDING: ClockIcon,
  PAYMENT_SUCCESS: CheckCircleIcon,
  PAYMENT_FAILED: XCircleIcon,
  PAYMENT_REFUNDED: ArrowPathIcon,

  PAYMENT: CreditCardIcon,
  PAYMENT_PAID: CheckCircleIcon,

  REFUND: ArrowPathIcon,
  STATUS: TruckIcon,
  NOTE: ChatBubbleLeftRightIcon,
};

// Colors for all event types
const COLORS: Record<string, string> = {
  ORDER_CREATED: "text-text-secondary",

  PAYMENT_INITIATED: "text-info",
  PAYMENT_PENDING: "text-warning",
  PAYMENT_SUCCESS: "text-success",
  PAYMENT_FAILED: "text-danger",
  PAYMENT_REFUNDED: "text-info",

  PAYMENT: "text-info",
  PAYMENT_PAID: "text-success",

  REFUND: "text-warning",
  STATUS: "text-primary",
  NOTE: "text-text-secondary",
};

export default function OrderTimeline({
  order,
  auditLogs,
}: {
  order: any;
  auditLogs: any[];
}) {
  const events: TimelineEvent[] = [];

  //
  // ORDER CREATED
  //
  events.push({
    id: `created-${order.id}`,
    type: "ORDER_CREATED",
    label: "Order created",
    at: new Date(order.createdAt),
  });

  //
  // PAYMENT EVENTS
  //
  for (const p of order.payments || []) {
    const base = {
      id: `payment-${p.id}`,
      at: new Date(p.createdAt),
      meta: {
        amount: p.amount,
        currency: p.currency,
        reference: p.reference,
        provider: p.provider,
        channel: p.channel,
      },
    };

    // Payment initiated
    events.push({
      ...base,
      type: "PAYMENT_INITIATED",
      label: `Payment initiated (${p.provider || "Unknown"})`,
    });

    // Payment status event
    events.push({
      ...base,
      id: `payment-status-${p.id}`,
      type: `PAYMENT_${p.status}`,
      label: PAYMENT_EVENT_LABELS[p.status],
    });

    // Payment marked as paid
    if (p.paidAt) {
      events.push({
        ...base,
        id: `payment-paid-${p.id}`,
        type: "PAYMENT_SUCCESS",
        label: "Payment marked as paid",
        at: new Date(p.paidAt),
      });
    }

    // Payment refunded
    if (p.status === "REFUNDED") {
      events.push({
        ...base,
        id: `payment-refund-${p.id}`,
        type: "PAYMENT_REFUNDED",
        label: "Payment refunded",
      });
    }
  }

  //
  // NOTES
  //
  for (const log of auditLogs) {
    if (log.action === "ORDER_NOTE") {
      events.push({
        id: `note-${log.id}`,
        type: "NOTE",
        label: log.metadata?.message || "Note added",
        at: new Date(log.createdAt),
      });
    }
  }

  //
  // REFUNDS
  //
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

  //
  // STATUS CHANGES
  //
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

  //
  // SORT EVENTS
  //
  events.sort((a, b) => a.at.getTime() - b.at.getTime());

  if (!events.length) return null;

  //
  // GROUP BY DAY
  //
  const grouped: Record<string, TimelineEvent[]> = {};
  for (const e of events) {
    const day = format(e.at, "yyyy-MM-dd");
    if (!grouped[day]) grouped[day] = [];
    grouped[day].push(e);
  }

  //
  // RENDER
  //
  return (
    <div className="border border-border-default rounded-md p-4 space-y-4">
      <h2 className="font-medium text-sm">Timeline</h2>

      <div className="space-y-6">
        {Object.entries(grouped).map(([day, dayEvents]) => (
          <div key={day} className="space-y-3">
            <div className="text-xs font-medium text-text-secondary">
              {format(new Date(day), "MMMM d, yyyy")}
            </div>

            <ol className="space-y-3 text-sm">
              {dayEvents.map((e) => {
                const Icon = ICONS[e.type] || ClockIcon;
                const color = COLORS[e.type] || "text-text-secondary";

                return (
                  <li key={e.id} className="flex gap-3">
                    <Icon className={`h-4 w-4 mt-1 ${color}`} />

                    <div>
                      <div className="font-medium">{e.label}</div>

                      <div className="text-xs text-text-secondary">
                        {format(e.at, "hh:mm a")}
                      </div>

                      {/* Payment details */}
                      {e.type.startsWith("PAYMENT") && e.meta && (
                        <div className="text-xs text-text-secondary mt-1">
                          {e.meta.currency} {(e.meta.amount / 100).toFixed(2)} · Ref:{" "}
                          {e.meta.reference}
                          {e.meta.channel && ` · ${e.meta.channel}`}
                        </div>
                      )}

                      {/* Refund details */}
                      {e.type === "REFUND" && e.meta && (
                        <div className="text-xs text-text-secondary mt-1">
                          Refunded: {(e.meta.amount / 100).toFixed(2)}
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        ))}
      </div>
    </div>
  );
}
