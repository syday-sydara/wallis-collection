// services/timeline/repositories/whatsapp.repo.ts
import { prisma } from "../../../lib/prisma";

export class WhatsAppTimelineRepo {
  static async fetch(identity) {
    const { customerId, phoneNormalized } = identity;

    return prisma.whatsAppMessage.findMany({
      where: {
        session: {
          OR: [
            { customerId: customerId ?? undefined },
            { phoneNormalized: phoneNormalized ?? undefined },
          ],
        },
      },
      include: { session: true },
      orderBy: { createdAt: "desc" },
    });
  }
}
