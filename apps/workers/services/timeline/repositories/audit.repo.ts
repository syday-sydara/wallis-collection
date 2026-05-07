// services/timeline/repositories/audit.repo.ts
import { prisma } from "@//lib/prisma";

export class AuditTimelineRepo {
  static async fetch(identity: {
    customerId?: string | null;
    phone?: string | null;
    sessionId?: string | null;
  }) {
    const { customerId, phone, sessionId } = identity;

    return prisma.auditLog.findMany({
      where: {
        OR: [
          customerId ? { customerId } : undefined,
          phone ? { phone } : undefined,
          sessionId ? { sessionId } : undefined,
        ].filter(Boolean),
      },
      orderBy: { createdAt: "desc" },
    });
  }
}
