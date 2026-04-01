// lib/security/events.ts
import { prisma } from "@/lib/db";

export async function logSecurityEvent(params: {
  userId?: string | null;
  type: string;
  message: string;
  severity?: "low" | "medium" | "high";
  ip?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, any>;
}) {
  const {
    userId,
    type,
    message,
    severity = "low",
    ip,
    userAgent,
    metadata,
  } = params;

  try {
    await prisma.securityEvent.create({
      data: {
        userId: userId ?? null,
        type,
        message,
        ip: ip ?? null,
        userAgent: userAgent ?? null,
        metadata: metadata ?? {},
        severity,
      },
    });
  } catch (err) {
    // Never throw inside middleware or auth flows
    console.error("Failed to log security event:", err);
  }
}