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

// Unified ICON map
const ICONS: Record<string, any> = {
  // Order
  ORDER_CREATED: ClockIcon,

  // Payment
  PAYMENT_INITIATED: CreditCardIcon,
  PAYMENT_PENDING: ClockIcon,
  PAYMENT_SUCCESS: CheckCircleIcon,
  PAYMENT_FAILED: XCircleIcon,
  PAYMENT_REFUNDED: ArrowPathIcon,
  PAYMENT: CreditCardIcon,
  PAYMENT_PAID: CheckCircleIcon,

  // Refund
  REFUND: ArrowPathIcon,

  // Status
  STATUS: TruckIcon,

  // Notes
  NOTE: ChatBubbleLeftRightIcon,

  // Fulfillment
  FULFILLMENT_CREATED: TruckIcon,
  FULFILLMENT_IN_TRANSIT: TruckIcon,
  FULFILLMENT_OUT_FOR_DELIVERY: TruckIcon,
  FULFILLMENT_DELIVERED: CheckCircleIcon,
  FULFILLMENT_FAILED: XCircleIcon,
};

// Unified COLOR map
const COLORS: Record<string, string> = {
  // Order
  ORDER_CREATED: "text-text-secondary",

  // Payment
  PAYMENT_INITIATED: "text-info",
  PAYMENT_PENDING: "text-warning",
  PAYMENT_SUCCESS: "text-success",
  PAYMENT_FAILED: "text-danger",
  PAYMENT_REFUNDED: "text-info",
  PAYMENT: "text-info",
  PAYMENT_PAID: "text-success",

  // Refund
  REFUND: "text-warning",

  // Status
  STATUS: "text-primary",

  // Notes
  NOTE: "text-text-secondary",

  // Fulfillment
  FULFILLMENT_CREATED: "text-info",
  FULFILLMENT_IN_TRANSIT: "text-primary",
  FULFILLMENT_OUT_FOR_DELIVERY: "text-warning",
  FULFILLMENT_DELIVERED: "text-success",
  FULFILLMENT_FAILED: "text-danger",
};

export default function OrderTimeline({
  order,
  auditLogs,
  fulfillments,
}: {
  order: any;
  auditLogs: any[];
  fulfillments: any[];
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

    events.push({
      ...base,
      type: "PAYMENT_INITIATED",
      label: `Payment initiated (${p.provider || "Unknown"})`,
    });

    events.push({
      ...base,
      id: `payment-status-${p.id}`,
      type: `PAYMENT_${p.status}`,
      label: PAYMENT_EVENT_LABELS[p.status],
    });

    if (p.paidAt) {
      events.push({
        ...base,
        id: `payment-paid-${p.id}`,
        type: "PAYMENT_SUCCESS",
        label: "Payment marked as paid",
        at: new Date(p.paidAt),
      });
    }

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
  // FULFILLMENT EVENTS
  //
  for (const f of fulfillments || []) {
    events.push({
      id: `fulfillment-${f.id}`,
      type: "FULFILLMENT_CREATED",
      label: `Fulfillment created (${f.carrier || "Unknown"})`,
      at: new Date(f.createdAt),
      meta: { tracking: f.tracking },
    });

    events.push({
      id: `fulfillment-status-${f.id}`,
      type: `FULFILLMENT_${f.status}`,
      label: `Fulfillment ${f.status.replace(/_/g, " ").toLowerCase()}`,
      at: new Date(f.updatedAt),
      meta: { tracking: f.tracking },
    });
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

                      {/* Fulfillment details */}
                      {e.type.startsWith("FULFILLMENT") && e.meta?.tracking && (
                        <div className="text-xs text-text-secondary mt-1">
                          Tracking: {e.meta.tracking}
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
