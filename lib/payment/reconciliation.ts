import { processPaymentEvent } from "@/lib/payment/processor";

export async function reconcilePendingPayments(limit = 100) {
  const pending = await prisma.order.findMany({
    where: {
      paymentStatus: "PENDING",
      paymentReference: { not: null },
      paymentProvider: { not: null }
    },
    take: limit
  });

  const results = [];

  for (const order of pending) {
    const result = await processPaymentEvent({
      provider: order.paymentProvider as any,
      reference: order.paymentReference!,
      source: "reconciliation"
    });

    results.push({ orderId: order.id, ...result });
  }

  return { processed: results.length, results };
}
