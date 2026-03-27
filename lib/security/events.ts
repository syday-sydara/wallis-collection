// lib/security/events.ts
import { prisma } from "@/lib/db";

export async function logSecurityEvent(params: {
  userId?: string | null;
  type: string;
  message: string;
  ip?: string | null;
  userAgent?: string | null;
}) {
  const { userId, type, message, ip, userAgent } = params;

  await prisma.securityEvent.create({
    data: {
      userId: userId ?? "anonymous",
      type,
      message,
      ip: ip ?? null,
      userAgent: userAgent ?? null
    }
  });
}
