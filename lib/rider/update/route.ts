import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyRiderSignature } from "@/lib/rider/sign";
import { sendDelivered, sendFailed } from "@/lib/whatsapp/events";

export async function GET(req: NextRequest) {
  const f = req.nextUrl.searchParams.get("f");
  const status = req.nextUrl.searchParams.get("s");
  const token = req.nextUrl.searchParams.get("t");

  if (!f || !status || !token) {
    return NextResponse.json({ ok: false, error: "missing_params" });
  }

  if (!verifyRiderSignature(f, status, token)) {
    return NextResponse.json({ ok: false, error: "invalid_signature" });
  }

  const fulfillment = await prisma.fulfillment.update({
    where: { id: f },
    data: { status },
    include: { order: true },
  });

  // Notify customer
  if (status === "DELIVERED") {
    await sendDelivered(fulfillment.order);
  }

  if (status === "FAILED") {
    await sendFailed(fulfillment.order);
  }

  return NextResponse.json({ ok: true, status });
}
