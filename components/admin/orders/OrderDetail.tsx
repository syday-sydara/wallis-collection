import FulfillmentPanel from "./FulfillmentPanel";
import OrderNotes from "./OrderNotes";
import OrderTimeline from "./OrderTimeline";

export default function OrderDetail({
  order,
  auditLogs,
  notes,
  fulfillments,
}: {
  order: any;
  auditLogs: any[];
  notes: any[];
  fulfillments: any[];
}) {
  return (
    <div className="space-y-6">
      {/* Header + actions ... */}

      {/* Fulfillment */}
      <FulfillmentPanel order={order} fulfillments={fulfillments} />

      {/* Notes */}
      <OrderNotes orderId={order.id} notes={notes} />

      {/* Timeline — FIXED: now includes fulfillments */}
      <OrderTimeline
        order={order}
        auditLogs={auditLogs}
        fulfillments={fulfillments}
      />
    </div>
  );
}
