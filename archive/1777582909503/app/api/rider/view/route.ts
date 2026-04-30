import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyRiderSignature } from "@/lib/rider/sign";

export async function GET(req: NextRequest) {
  const f = req.nextUrl.searchParams.get("f");
  const status = req.nextUrl.searchParams.get("s");
  const token = req.nextUrl.searchParams.get("t");

  if (!f || !status || !token) {
    return NextResponse.json({ ok: false, error: "missing_params" });
  }

  // Validate signature
  const valid = verifyRiderSignature(f, status, token);
  if (!valid) {
    return NextResponse.json({ ok: false, error: "invalid_signature" });
  }

  const fulfillment = await prisma.fulfillment.findUnique({
    where: { id: f },
    include: { order: true },
  });

  if (!fulfillment) {
    return NextResponse.json({ ok: false, error: "not_found" });
  }

  return NextResponse.json({
    ok: true,
    fulfillment,
    order: fulfillment.order,
  });
}
