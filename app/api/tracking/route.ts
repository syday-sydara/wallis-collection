// app/api/tracking/route.ts
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return Response.json({ error: "Order not found" }, { status: 404 });
    }

    const { trackingNumber, courier, trackingUrl } = order;

    if (!trackingNumber || !courier) {
      return Response.json({
        error: "Tracking not available yet",
      });
    }

    let trackingData = null;

    switch (courier) {
      case "GIGL":
        trackingData = await fetch(
          `https://api.giglogistics.com/api/v1/tracking/${trackingNumber}`,
          {
            headers: { "API-KEY": process.env.GIGL_API_KEY! },
          }
        ).then((r) => r.json());
        break;

      case "Kwik":
        trackingData = await fetch(
          `https://api.kwik.delivery/v1/track/${trackingNumber}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.KWIK_API_KEY}`,
            },
          }
        ).then((r) => r.json());
        break;

      case "Sendbox":
        trackingData = await fetch(
          `https://api.sendbox.co/tracking/${trackingNumber}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.SENDBOX_API_KEY}`,
            },
          }
        ).then((r) => r.json());
        break;

      case "ACE":
        trackingData = await fetch(
          `https://api.ace.ng/v1/track/${trackingNumber}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.ACE_API_KEY}`,
            },
          }
        ).then((r) => r.json());
        break;

      default:
        // Fallback for couriers with no API
        return Response.json({
          manual: true,
          courier,
          trackingUrl,
          message: "Tracking available on courier website",
        });
    }

    return Response.json({ courier, trackingData });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to fetch tracking information" },
      { status: 500 }
    );
  }
}