// lib/audit.ts
import { prisma } from "./prisma";
import { Correlation } from "./correlation";

export const Audit = {
  async write(input) {
    const ctx = Correlation.get();

    return prisma.auditLog.create({
      data: {
        ...input,
        traceId: ctx.traceId,
        requestId: ctx.requestId,
      },
    });
  },
};
