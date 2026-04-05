// app/api/orders/reconcile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ok } from "@/lib/api/response";
import { reconcilePendingPayments } from "@/lib/payment/reconciliation";

function timeout(ms: number) {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Timeout")), ms)
  );
}

export async function POST(req: NextRequest) {
  // --- Auth ---
  const auth = req.headers.get("authorization");

  if (!process.env.CRON_SECRET) {
    console.error("CRON_SECRET is not set");
    return NextResponse.json(
      { error: "Server misconfiguration" },
      { status: 500 }
    );
  }

  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const summary = await Promise.race([
      reconcilePendingPayments(),
      timeout(10000),
    ]);

    console.log("Reconciliation summary:", summary);

    return ok(summary);
  } catch (err: any) {
    console.error("Reconciliation failed:", err);

    return NextResponse.json(
      { error: "Reconciliation failed", reason: err.message },
      { status: 500 }
    );
  }
}