// lib/security/events.ts
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { encrypt } from "@/lib/security/crypto";

const VALID_SEVERITIES = ["low", "medium", "high"] as const;

export async function logSecurityEvent(params: {
  userId?: string | null;
  type: string;
  message: string;
  severity?: "low" | "medium" | "high";
  ip?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, any>;
  category?: string | null;
  encryptMetadata?: boolean;
}) {
  const {
    userId = null,
    type,
    message,
    severity = "low",
    ip,
    userAgent,
    metadata = {},
    category = null,
    encryptMetadata = false,
  } = params;

  // Normalize severity
  const sev = VALID_SEVERITIES.includes(severity) ? severity : "low";

  // Normalize category
  const normalizedCategory = category?.toLowerCase() ?? null;

  // Safe metadata
  let safeMetadata: any = {};
  try {
    safeMetadata = JSON.parse(JSON.stringify(metadata));
  } catch {
    safeMetadata = { _error: "Invalid metadata structure" };
  }

  // Optional encryption
  const storedMetadata = encryptMetadata
    ? { encrypted: encrypt(JSON.stringify(safeMetadata)) }
    : safeMetadata;

  // Safe header access
  let detectedIp = ip ?? null;
  let detectedUA = userAgent ?? null;

  try {
    const h = headers();
    detectedIp = detectedIp ?? h.get("x-forwarded-for") ?? null;
    detectedUA = detectedUA ?? h.get("user-agent") ?? null;
  } catch {
    // headers() unavailable — ignore
  }

  // Versioning for future schema changes
  const version = 1;

  try {
    await prisma.securityEvent.create({
      data: {
        version,
        userId,
        type,
        message,
        severity: sev,
        ip: detectedIp,
        userAgent: detectedUA,
        metadata: storedMetadata,
        category: normalizedCategory,
      },
    });
  } catch (err) {
    console.error("Failed to log security event:", err);
  }
}