// app/api/cron/reconcile-payments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { reconcilePendingPayments } from "@/lib/payment/reconciliation";
import { startTimer } from "@/lib/metrics";
import { logEvent } from "@/lib/logger";

export async function GET(req: NextRequest) {
  const stop = startTimer("cron_reconcile_payments");

  try {
    const limitParam = req.nextUrl.searchParams.get("limit");
    const limit = limitParam ? Number(limitParam) : 100;

    const result = await reconcilePendingPayments(
      Number.isNaN(limit) ? 100 : limit
    );

    logEvent("reconcile_payments_run", result);

    stop();
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
