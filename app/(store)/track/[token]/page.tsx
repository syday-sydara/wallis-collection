import { prisma } from "@/lib/prisma";
import TrackingSearch from "../TrackingSearch";
import PublicTimeline from "@/components/public/PublicTimeline";

export default async function TrackingPage({ params }) {
  const order = await prisma.order.findFirst({
    where: {
      OR: [
        { trackingNumber: params.token },
        { phone: params.token },
        { trackingToken: params.token },
      ],
    },
    include: {
      fulfillments: true,
      payments: true,
    },
  });

  return (
    <div className="max-w-xl mx-auto p-6 space-y-8">
      <TrackingSearch />

      {!order ? (
        <div className="p-6 text-center space-y-2">
          <h1 className="text-lg font-semibold">Order not found</h1>
          <p className="text-text-secondary">
            Please check your tracking number or phone number.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="card p-4 space-y-2">
            <div className="text-sm text-text-secondary">Order</div>
            <div className="font-medium">#{order.id.slice(0, 8)}</div>

            <div className="text-sm text-text-secondary">
              {order.shippingType === "PICKUP"
                ? "Pickup order"
                : `Delivery to ${order.shippingAddress?.city || "your area"}`}
            </div>

            {/* COD Messaging */}
            {order.paymentMethod === "CASH" && (
              <div className="text-warning text-sm font-medium">
                Payment will be collected on delivery
              </div>
            )}

            {/* Delivery Notes */}
            {order.deliveryNotes && (
              <div className="text-sm text-text-secondary">
                Delivery notes: {order.deliveryNotes}
              </div>
            )}
          </div>

          {/* Timeline */}
          <PublicTimeline order={order} />

          {/* Carrier Deep Link */}
          {order.carrier && order.trackingNumber && (
            <a
              href={getCarrierLink(order.carrier, order.trackingNumber)}
              target="_blank"
              className="btn btn-primary w-full"
            >
              Open {order.carrier} Tracking
            </a>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------------- Nigerian Carrier Deep Links ---------------- */

function getCarrierLink(carrier: string, tracking: string) {
  const c = carrier.toLowerCase();

  if (c.includes("gig"))
    return `https://giglogistics.com/track?trackingId=${tracking}`;

  if (c.includes("kwik"))
    return `https://kwik.delivery/track/${tracking}`;

  if (c.includes("sendbox"))
    return `https://sendbox.co/tracking/${tracking}`;

  if (c.includes("topship"))
    return `https://topship.africa/track/${tracking}`;

  if (c.includes("dhl"))
    return `https://www.dhl.com/ng-en/home/tracking.html?tracking-id=${tracking}`;

  if (c.includes("fedex"))
    return `https://www.fedex.com/fedextrack/?tracknumbers=${tracking}`;

  return "#";
}
