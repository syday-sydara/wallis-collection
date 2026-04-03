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
    userId = null,
    type,
    message,
    severity = "low",
    ip = null,
    userAgent = null,
    metadata = {}
  } = params;

  try {
    await prisma.securityEvent.create({
      data: {
        userId,
        type,
        message,
        severity,
        ip,
        userAgent,
        metadata
      }
    });
  } catch (err) {
    // Never throw inside security or auth flows
    console.error("Failed to log security event:", err);
  }
}
