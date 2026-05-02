// producers/stock.reconciliation.producer.ts
import {
  stockReconciliationQueue,
  STOCK_RECONCILIATION_QUEUE_NAME,
} from "../queues/stock.reconciliation.queue";

/**
 * StockReconciliationProducer
 *
 * Responsibilities:
 * - Schedule reconciliation cycles
 * - Deterministic jobId (cycle-first)
 * - Timestamp injection for ordering + debugging
 */
export const StockReconciliationProducer = {
  async schedule(cycleId: string) {
    const jobId = `${STOCK_RECONCILIATION_QUEUE_NAME}-${cycleId}`;

    await stockReconciliationQueue.add(
      "reconcile",
      {
        cycleId,
        timestamp: new Date(),
      },
      {
        jobId,
        removeOnComplete: true,
        removeOnFail: false,
      }
    );

    console.log("[STOCK RECONCILIATION PRODUCER] Scheduled cycle:", {
      cycleId,
    });
  },
};
