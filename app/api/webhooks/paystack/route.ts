// app/api/webhooks/paystack/route.ts

import { NextRequest, NextResponse } from "next/server";
import { logEvent } from "@/lib/logger";
import { startTimer } from "@/lib/metrics";
import * as Sentry from "@sentry/nextjs";
import { prisma } from "@/lib/db";
import crypto from "crypto";

function verifyPaystackSignature(body: any, signature: string | null, secret: string) {
  if (!signature) return false;
  const hash = crypto
    .createHmac("sha512", secret)
    .update(JSON.stringify(body))
    .digest("hex");
  return hash === signature;
}

export async function POST(req: NextRequest) {
  const endTimer = startTimer("webhook_paystack");

  try {
    const signature = req.headers.get("x-paystack-signature");
    const body = await req.json();

    const valid = verifyPaystackSignature(
      body,
      signature,
      process.env.PAYSTACK_WEBHOOK_SECRET!
    );

    if (!valid) {
      logEvent("webhook_invalid_signature", { provider: "paystack" }, "warn");
      endTimer();
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const reference = body?.data?.reference as string | undefined;
    if (!reference) {
      logEvent("webhook_missing_reference", { provider: "paystack" }, "warn");
      endTimer();
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    logEvent("webhook_received", { provider: "paystack", reference });

    const order = await prisma.order.findUnique({ where: { id: reference } });
    if (!order) {
      logEvent("webhook_unknown_order", { reference }, "warn");
      endTimer();
      return NextResponse.json({ ok: false }, { status: 404 });
    }

    if (order.paymentStatus === "PAID") {
      logEvent("webhook_duplicate", { orderId: order.id });
      endTimer();
      return NextResponse.json({ ok: true });
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { paymentStatus: "PAID" }
    });

    logEvent("webhook_order_marked_paid", {
      provider: "paystack",
      orderId: order.id
    });

    endTimer();
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    Sentry.captureException(err);
    logEvent(
      "webhook_unexpected_error",
      { provider: "paystack", message: err?.message, stack: err?.stack },
      "error"
    );
    endTimer();
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
