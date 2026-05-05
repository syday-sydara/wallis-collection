// services/timeline/repositories/audit.repo.ts
import { prisma } from "../../../lib/prisma";

export class AuditTimelineRepo {
  static async fetch(identity) {
    const { customerId, phoneNormalized } = identity;

    return prisma.auditLog.findMany({
      where: {
        OR: [
          { entityId: customerId ?? "" },
          { entityId: phoneNormalized ?? "" },
        ],
      },
      orderBy: { createdAt: "desc" },
    });
  }
}
