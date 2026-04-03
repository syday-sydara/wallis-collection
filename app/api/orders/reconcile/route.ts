// app/api/orders/reconcile/route.ts
import { NextRequest } from "next/server";
import { rateLimited } from "@/lib/api/rate-limited";
import { ok } from "@/lib/api/response";
import { reconcilePendingPayments } from "@/lib/payment/reconciliation";

export async function GET(req: NextRequest) {
  const ip = req.ip ?? "anonymous";
  const limitCheck = rateLimited(req, ip);

  if (!("allowed" in limitCheck)) {
    // Rate limit exceeded → response already generated
    return limitCheck;
  }

  const summary = await reconcilePendingPayments();
  return ok(summary, { headers: limitCheck.headers });
}