// app/api/cron/reconcile-payments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { reconcilePendingPayments } from "@/lib/payment/reconciliation";
import { startTimer } from "@/lib/metrics";
import { logEvent } from "@/lib/logger";

export async function POST(req: NextRequest) {
  const stop = startTimer("cron_reconcile_payments");

  try {
    // --- AUTH ---
    const key = req.headers.get("x-cron-key");
    if (key !== process.env.CRON_SECRET) {
      stop();
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // --- LIMIT ---
    const limitParam = req.nextUrl.searchParams.get("limit");
    const parsed = Number(limitParam);
    const limit = Math.min(Number.isNaN(parsed) ? 100 : parsed, 500);

    // --- RUN ---
    const result = await reconcilePendingPayments(limit);

    logEvent("reconcile_payments_run", {
      ...result,
      limit,
      durationMs: stop(),
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (err: any) {
    logEvent(
      "reconcile_payments_error",
      { message: err?.message, stack: err?.stack },
      "error"
    );

    stop();
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}