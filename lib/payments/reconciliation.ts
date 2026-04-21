// lib/payments/reconciliation.ts
import pLimit from "p-limit";
import { prisma } from "@/lib/prisma";
import { processPaymentEvent } from "@/lib/payments/processor";
import { logSecurityEvent } from "@/lib/security/logSecurityEvent";

const CONCURRENCY_LIMIT = 5;
const MAX_BATCH = 200;
const RETRY_COUNT = 2;

interface ReconciliationResult {
  paymentId: string;
  orderId: string;
  ok: boolean;
  reason: string;
  score?: number;
}

interface ReconciliationSummary {
  processed: number;
  fulfilled: number;``
  rejected: number;
  pending: number;
  details: ReconciliationResult[];
}

export async function reconcilePendingPayments(limit = 100): Promise<ReconciliationSummary> {
  const safeLimit = Math.min(limit, MAX_BATCH);

  // --- 1. Fetch pending payments older than 5 minutes ---
  const pendingPayments = await prisma.payment.findMany({
    where: {
      status: "PENDING",
      provider: { in: ["paystack", "monnify"] },
      createdAt: {
        lte: new Date(Date.now() - 5 * 60 * 1000),
      },
    },
    include: { order: true },
    orderBy: { createdAt: "asc" },
    take: safeLimit,
  });

  const limitConcurrency = pLimit(CONCURRENCY_LIMIT);

  const results: ReconciliationResult[] = await Promise.all(
    pendingPayments.map((payment) =>
      limitConcurrency(async () => {
        let attempt = 0;
        let lastError: unknown = null;

        while (attempt <= RETRY_COUNT) {
          try {
            const result = await processPaymentEvent({
              provider: payment.provider as "paystack" | "monnify",
              reference: payment.reference,
              rawPayload: null,
              source: "reconciliation",
            });

            return {
              paymentId: payment.id,
              orderId: payment.orderId,
              ok: result.ok ?? false,
              reason: result.reason,
              score: result.score,
            };
          } catch (err) {
            lastError = err;
            attempt++;

            await logSecurityEvent({
              type: "RECONCILIATION_RETRY",
              message: `Reconciliation retry ${attempt} for payment ${payment.id}`,
              severity: "medium",
              metadata: { error: String(err), attempt },
            });
          }
        }

        await logSecurityEvent({
          type: "RECONCILIATION_FAILED",
          message: `Reconciliation failed for payment ${payment.id}`,
          severity: "high",
          metadata: { error: String(lastError) },
        });

        return {
          paymentId: payment.id,
          orderId: payment.orderId,
          ok: false,
          reason: "reconciliation_failed",
        };
      })
    )
  );

  return {
    processed: pendingPayments.length,
    fulfilled: results.filter((r) => r.ok && r.reason === "paid").length,
    rejected: results.filter((r) => !r.ok && r.reason !== "pending").length,
    pending: results.filter((r) => r.reason === "pending").length,
    details: results,
  };
}
