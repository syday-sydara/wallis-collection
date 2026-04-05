// app/api/orders/reconcile/route.ts

import { NextRequest, NextResponse } from "next/server";
import { ok } from "@/lib/api/response";
import { reconcilePendingPayments } from "@/lib/payment/reconciliation";

export async function POST(req: NextRequest) {
  // AUTH PROTECTION (CRITICAL)
  const auth = req.headers.get("authorization");

  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const summary = await Promise.race([
      reconcilePendingPayments(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), 10000)
      ),
    ]);

    console.log("Reconciliation summary:", summary);

    return ok(summary);
  } catch (err) {
    console.error("Reconciliation failed:", err);

    return NextResponse.json(
      { error: "Reconciliation failed" },
      { status: 500 }
    );
  }
}