import pLimit from "p-limit";
import { processPaymentEvent } from "@/lib/payment/processor";

export async function reconcilePendingPayments(limit = 100) {
  const safeLimit = Math.min(limit, 200);

  const pending = await prisma.order.findMany({
    where: {
      paymentStatus: "PENDING",
      paymentReference: { not: null },
      paymentProvider: { in: ["paystack", "monnify"] }
    },
    take: safeLimit
  });

  const limitConcurrency = pLimit(5);

  const results = await Promise.all(
    pending.map(order =>
      limitConcurrency(async () => {
        const result = await processPaymentEvent({
          provider: order.paymentProvider as any,
          reference: order.paymentReference!,
          source: "reconciliation"
        });

        return { orderId: order.id, ...result };
      })
    )
  );

  return { processed: results.length, results };
}