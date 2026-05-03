// workers/stock.reconciliation.worker.ts
import { Worker } from "bullmq";
import { STOCK_RECONCILIATION_QUEUE_NAME } from "../queues/stock.reconciliation.queue";
import { connection } from "../config/env";
import { prisma } from "../lib/prisma/prisma";
import { ReservationStatus } from "@prisma/client";
import { OrderProducer } from "../producers/order.producer";

export const stockReconciliationWorker = new Worker(
  STOCK_RECONCILIATION_QUEUE_NAME,
  async job => {
    console.log("[STOCK RECONCILIATION] Starting reconciliation cycle...");

    try {
      const variants = await prisma.productVariant.findMany({
        select: { id: true, stockQty: true },
      });

      for (const variant of variants) {
        const { id: variantId, stockQty } = variant;

        // Sum of active reservations
        const activeReservations = await prisma.stockReservation.findMany({
          where: {
            variantId,
            status: ReservationStatus.ACTIVE,
          },
          select: { id: true, quantity: true, expiresAt: true },
        });

        // Sum of consumed reservations
        const consumedReservations = await prisma.stockReservation.findMany({
          where: {
            variantId,
            status: ReservationStatus.CONSUMED,
          },
          select: { quantity: true },
        });

        const activeQty = activeReservations.reduce(
          (sum, r) => sum + r.quantity,
          0
        );

        const consumedQty = consumedReservations.reduce(
          (sum, r) => sum + r.quantity,
          0
        );

        const expectedStock = consumedQty - activeQty;

        // Detect drift
        if (stockQty !== expectedStock) {
          console.warn("[STOCK RECONCILIATION] Drift detected:", {
            variantId,
            stockQty,
            expectedStock,
          });

          // Fix stock
          await prisma.productVariant.update({
            where: { id: variantId },
            data: { stockQty: expectedStock },
          });

          console.log("[STOCK RECONCILIATION] Corrected stock:", {
            variantId,
            correctedTo: expectedStock,
          });
        }

        // Expire any overdue reservations
        for (const reservation of activeReservations) {
          if (reservation.expiresAt <= new Date()) {
            console.log("[STOCK RECONCILIATION] Expiring overdue reservation:", {
              reservationId: reservation.id,
              variantId,
            });

            await prisma.stockReservation.update({
              where: { id: reservation.id },
              data: { status: ReservationStatus.EXPIRED },
            });

            // Release stock
            await prisma.productVariant.update({
              where: { id: variantId },
              data: { stockQty: { increment: reservation.quantity } },
            });

            // Emit event
            await OrderProducer.stockReleased(reservation.id, "expired-reconciliation");
          }
        }
      }

      console.log("[STOCK RECONCILIATION] Completed cycle");
    } catch (err) {
      console.error("[STOCK RECONCILIATION] Error during reconciliation", err);
      throw err; // allow BullMQ retry
    }
  },
  {
    connection,
    concurrency: 1, // reconciliation must be single-threaded
  }
);

// ---------------------------------------------------------
// Worker lifecycle logging
// ---------------------------------------------------------

stockReconciliationWorker.on("ready", () => {
  console.log("[STOCK RECONCILIATION WORKER] Ready");
});

stockReconciliationWorker.on("active", job => {
  console.log(`[STOCK RECONCILIATION WORKER] Active job ${job.id}`);
});

stockReconciliationWorker.on("completed", job => {
  console.log(`[STOCK RECONCILIATION WORKER] Completed job ${job.id}`);
});

stockReconciliationWorker.on("failed", (job, err) => {
  console.error(`[STOCK RECONCILIATION WORKER] Job failed ${job?.id}`, err);
});

stockReconciliationWorker.on("error", err => {
  console.error("[STOCK RECONCILIATION WORKER] Worker error", err);
});

// ---------------------------------------------------------
// Graceful shutdown
// ---------------------------------------------------------

process.on("SIGTERM", async () => {
  console.log("[STOCK RECONCILIATION WORKER] Shutting down...");
  await stockReconciliationWorker.close();
});
