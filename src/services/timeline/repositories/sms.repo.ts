// services/timeline/repositories/sms.repo.ts
import { prisma } from "../../../lib/prisma";

export class SmsTimelineRepo {
  static async fetch(identity) {
    const { phoneNormalized } = identity;

    return prisma.smsMessage.findMany({
      where: { to: phoneNormalized ?? undefined },
      orderBy: { createdAt: "desc" },
    });
  }
}
