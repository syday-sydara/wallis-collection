// workers/reservation.expiry.worker.ts
import { Worker } from "bullmq";
import { RESERVATION_EXPIRY_QUEUE_NAME } from "../queues/reservation.expiry.queue";
import { connection } from "../config/redis";
import { prisma } from "../lib/prisma/prisma";
import { ReservationStatus } from "@prisma/client";
import { OrderProducer } from "../producers/order.producer";

export const reservationExpiryWorker = new Worker(
  RESERVATION_EXPIRY_QUEUE_NAME,
  async job => {
    const { reservationId } = job.data;

    try {
      // Lock reservation row
      const reservation = await prisma.$transaction(async tx => {
        const [res] = await tx.$queryRaw<
          {
            id: string;
            status: ReservationStatus;
            orderId: string | null;
            quantity: number;
            variantId: string;
            expiresAt: Date;
          }[]
        >`
          SELECT * FROM "StockReservation"
          WHERE id = ${reservationId}
          FOR UPDATE
        `;

        if (!res) {
          console.warn("[RESERVATION EXPIRY] Reservation not found:", reservationId);
          return null;
        }

        // Already consumed → do nothing
        if (res.status === ReservationStatus.CONSUMED) {
          return res;
        }

        // Not expired → do nothing
        if (res.expiresAt > new Date()) {
          return res;
        }

        // Expire reservation
        const updated = await tx.stockReservation.update({
          where: { id: reservationId },
          data: { status: ReservationStatus.EXPIRED },
        });

        // Release stock
        await tx.productVariant.update({
          where: { id: res.variantId },
          data: {
            stockQty: { increment: res.quantity },
          },
        });

        return updated;
      });

      if (!reservation) return;

      if (reservation.status === ReservationStatus.EXPIRED) {
        console.log("[RESERVATION EXPIRED]", {
          reservationId,
          variantId: reservation.variantId,
          quantity: reservation.quantity,
        });

        // Emit event for downstream systems
        await OrderProducer.stockReleased(reservationId, "expired");
      }
    } catch (err) {
      console.error("[RESERVATION EXPIRY WORKER] Failed:", reservationId, err);
      throw err; // allow BullMQ retry
    }
  },
  {
    connection,
    concurrency: 5,
  }
);

// ---------------------------------------------------------
// Worker lifecycle logging
// ---------------------------------------------------------

reservationExpiryWorker.on("ready", () => {
  console.log("[RESERVATION EXPIRY WORKER] Ready");
});

reservationExpiryWorker.on("active", job => {
  console.log(`[RESERVATION EXPIRY WORKER] Active job ${job.id}`);
});

reservationExpiryWorker.on("completed", job => {
  console.log(`[RESERVATION EXPIRY WORKER] Completed job ${job.id}`);
});

reservationExpiryWorker.on("failed", (job, err) => {
  console.error(`[RESERVATION EXPIRY WORKER] Job failed ${job?.id}`, err);
});

reservationExpiryWorker.on("error", err => {
  console.error("[RESERVATION EXPIRY WORKER] Worker error", err);
});

// ---------------------------------------------------------
// Graceful shutdown
// ---------------------------------------------------------

process.on("SIGTERM", async () => {
  console.log("[RESERVATION EXPIRY WORKER] Shutting down...");
  await reservationExpiryWorker.close();
});
