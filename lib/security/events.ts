// lib/security/events.ts
import { prisma } from "@/lib/db";

export async function logSecurityEvent(params: {
  userId?: string | null;
  type: string;
  message: string;
}) {
  const { userId, type, message } = params;

  await prisma.securityEvent.create({
    data: {
      userId: userId ?? "anonymous",
      type,
      message
    }
  });
}
