// lib/payments/reconciliation.ts
import pLimit from "p-limit";
import { prisma } from "@/lib/db";
import { processPaymentEvent } from "@/lib/payments/processor";

type ReconciliationResult =
  | { orderId: string; status: "pending" }
  | { orderId: string; ok: boolean; reason: string; score?: number };

interface ReconciliationSummary {
  processed: number;
  fulfilled: number;
  rejected: number;
  pending: number;
  details: ReconciliationResult[];
}

const CONCURRENCY_LIMIT = 5;
const MAX_BATCH = 200;
const RETRY_COUNT = 2;

/**
 * Reconcile pending payments with the payment providers.
 * Only considers orders older than 5 minutes to avoid race conditions.
 */
export async function reconcilePendingPayments(
  limit = 100
): Promise<ReconciliationSummary> {
  const safeLimit = Math.min(limit, MAX_BATCH);

  const pending = await prisma.order.findMany({
    where: {
      paymentStatus: "PENDING",
      paymentReference: { not: null },
      paymentProvider: { in: ["paystack", "monnify"] },
      createdAt: {
        lte: new Date(Date.now() - 5 * 60 * 1000),
      },
    },
    orderBy: { createdAt: "asc" },
    take: safeLimit,
  });

  const limitConcurrency = pLimit(CONCURRENCY_LIMIT);

  const results: ReconciliationResult[] = await Promise.all(
    pending.map((order) =>
      limitConcurrency(async () => {
        let attempt = 0;
        let lastError: unknown = null;

        while (attempt <= RETRY_COUNT) {
          try {
            const result = await processPaymentEvent({
              provider: order.paymentProvider as "paystack" | "monnify",
              reference: order.paymentReference!,
              source: "reconciliation",
            });

            // Treat "pending" payments separately
            if (result.reason === "pending") {
              return { orderId: order.id, status: "pending" } as const;
            }

            return { orderId: order.id, ...result } as ReconciliationResult;
          } catch (err) {
            lastError = err;
            attempt++;
            console.warn(
              `Reconciliation attempt ${attempt} failed for order ${order.id}:`,
              err
            );
          }
        }

        console.error(
          `Reconciliation failed after ${RETRY_COUNT + 1} attempts for order ${order.id}`,
          lastError
        );
        return {
          orderId: order.id,
          ok: false,
          reason: "reconciliation_failed",
        } as const;
      })
    )
  );

  const summary: ReconciliationSummary = {
    processed: pending.length,
    fulfilled: results.filter((r) => r.ok !== false && r.status !== "pending")
      .length,
    rejected: results.filter((r) => r.ok === false).length,
    pending: results.filter((r) => r.status === "pending").length,
    details: results,
  };

  return summary;
}