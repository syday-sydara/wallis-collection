// lib/payments/reconciliation.ts
import pLimit from "p-limit";
import { prisma } from "@/lib/prisma";
import { processPaymentEvent } from "@/lib/payments/processor";
import { logSecurityEvent } from "@/lib/security/logSecurityEvent";

const CONCURRENCY_LIMIT = 5;
const MAX_BATCH = 200;
const RETRY_COUNT = 2;

export async function reconcilePendingPayments(limit = 100) {
  const safeLimit = Math.min(limit, MAX_BATCH);

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

  const results = await Promise.all(
    pendingPayments.map((payment) =>
      limitConcurrency(async () => {
        let attempt = 0;
        let lastError: unknown = null;

        while (attempt <= RETRY_COUNT) {
          try {
            const result = await processPaymentEvent({
              provider: payment.provider as any,
              reference: payment.reference,
              rawPayload: null,
              source: "reconciliation",
            });

            // Map special reasons to status updates if needed
            if (result.reason === "expired") {
              await prisma.payment.update({
                where: { id: payment.id },
                data: { status: "EXPIRED" },
              });
            }

            if (result.reason === "partial") {
              await prisma.payment.update({
                where: { id: payment.id },
                data: { status: "PARTIAL" },
              });
            }

            return {
              paymentId: payment.id,
              orderId: payment.orderId,
              ok: result.ok ?? false,
              reason: result.reason,
              score: (result as any).score,
            };
          } catch (err) {
            lastError = err;
            attempt++;

            await logSecurityEvent({
              type: "RECONCILIATION_RETRY",
              message: `Retry ${attempt} for payment ${payment.id}`,
              severity: "medium",
              metadata: { error: String(err) },
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
