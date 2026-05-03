// services/timeline/repositories/reservation.repo.ts
import { prisma } from "../../../lib/prisma";

export class ReservationTimelineRepo {
  static async fetch(identity) {
    const { customerId, phoneNormalized } = identity;

    return prisma.stockReservation.findMany({
      where: {
        order: {
          OR: [
            { customerId: customerId ?? undefined },
            { phoneNormalized: phoneNormalized ?? undefined },
            { whatsAppSession: { phoneNormalized: phoneNormalized ?? undefined } },
          ],
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }
}
