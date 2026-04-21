import TrackingSearch from "./TrackingSearch";
import PublicTimeline from "@/components/public/PublicTimeline";

export default async function TrackingPage({ params }) {
  const order = await prisma.order.findUnique({
    where: { trackingToken: params.token },
    include: {
      fulfillments: true,
      payments: true,
    },
  });

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <TrackingSearch />

      {!order ? (
        <div className="p-6 text-center">
          <h1 className="text-xl font-semibold">Tracking link not found</h1>
          <p className="text-text-secondary mt-2">
            Please check your tracking number.
          </p>
        </div>
      ) : (
        <>
          <div className="border border-border-default rounded-md p-4">
            <div className="text-sm text-text-secondary">Order</div>
            <div className="font-medium">#{order.id.slice(0, 8)}</div>
          </div>

          <PublicTimeline order={order} />
        </>
      )}

      <a
  href={`https://wa.me/${process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP}?text=I want to track my order: ${order.trackingToken}`}
  className="btn w-full"
  style={{ background: "rgb(var(--color-whatsapp))", color: "#fff" }}
>
  Track via WhatsApp
</a>

    </div>
  );
}
