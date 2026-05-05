// services/timeline/repositories/payment.repo.ts
import { prisma } from "../../../lib/prisma";

export class PaymentTimelineRepo {
  static async fetch(identity) {
    const { customerId, phoneNormalized } = identity;

    return prisma.payment.findMany({
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
