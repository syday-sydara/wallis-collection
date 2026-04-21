import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyRiderSignature } from "@/lib/rider/sign";
import { sendDelivered, sendFailed } from "@/lib/whatsapp/events";

export async function POST(req: NextRequest) {
  let body: any;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" });
  }

  const { f, status, t, notes } = body;

  if (!f || !status || !t) {
    return NextResponse.json({ ok: false, error: "missing_params" });
  }

  if (!["DELIVERED", "FAILED"].includes(status)) {
    return NextResponse.json({ ok: false, error: "invalid_status" });
  }

  // Validate signature
  const valid = verifyRiderSignature(f, status, t);
  if (!valid) {
    return NextResponse.json({ ok: false, error: "invalid_signature" });
  }

  // Update fulfillment
  const fulfillment = await prisma.fulfillment.update({
    where: { id: f },
    data: {
      status,
      riderNotes: notes || null,
    },
    include: { order: true },
  });

  // Notify customer
  if (status === "DELIVERED") {
    await sendDelivered(fulfillment.order);
  }

  if (status === "FAILED") {
    await sendFailed(fulfillment.order);
  }

  return NextResponse.json({
    ok: true,
    status,
    fulfillment,
  });
}
