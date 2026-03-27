// app/api/webhooks/paystack/route.ts

import { NextRequest, NextResponse } from "next/server";
import { logEvent } from "@/lib/logger";
import { startTimer } from "@/lib/metrics";
import * as Sentry from "@sentry/nextjs";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const endTimer = startTimer("webhook_paystack");

  try {
    const signature = req.headers.get("x-paystack-signature");
    const body = await req.json();

    // TODO: verify signature properly
    const isValidSignature = Boolean(signature);

    if (!isValidSignature) {
      logEvent(
        "webhook_invalid_signature",
        {
          provider: "paystack"
        },
        "warn"
      );

      endTimer();
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const reference = body?.data?.reference as string | undefined;

    if (!reference) {
      logEvent(
        "webhook_missing_reference",
        { provider: "paystack" },
        "warn"
      );
      endTimer();
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    logEvent("webhook_received", {
      provider: "paystack",
      reference
    });

    const dbTimer = startTimer("db.order.update_from_webhook");

    const order = await prisma.order.update({
      where: { id: reference },
      data: { paymentStatus: "PAID" }
    });

    dbTimer();

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
      {
        provider: "paystack",
        message: err?.message,
        stack: err?.stack
      },
      "error"
    );

    endTimer();

    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
