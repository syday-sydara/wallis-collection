// producers/reservation.expiry.producer.ts
import {
  reservationExpiryQueue,
  RESERVATION_EXPIRY_QUEUE_NAME,
} from "../queues/domain/reservation.expiry.queue";

/**
 * ReservationExpiryProducer
 *
 * Responsibilities:
 * - Emit expiry jobs for reservations
 * - Deterministic jobId (reservationId-first)
 * - Timestamp injection for ordering + debugging
 */
export const ReservationExpiryProducer = {
  async scheduleExpiry(reservationId: string, delayMs: number) {
    const jobId = `${RESERVATION_EXPIRY_QUEUE_NAME}-${reservationId}`;

    await reservationExpiryQueue.add(
      "expire",
      {
        reservationId,
        timestamp: new Date(),
      },
      {
        jobId,
        delay: delayMs, // schedule expiry in the future
        removeOnComplete: true,
        removeOnFail: false,
      }
    );

    console.log("[RESERVATION EXPIRY PRODUCER] Scheduled expiry:", {
      reservationId,
      delayMs,
    });
  },
};
