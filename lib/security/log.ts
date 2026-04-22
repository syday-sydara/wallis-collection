// lib/security/log.ts
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { encrypt } from "@/lib/security/crypto";
import { randomUUID } from "crypto";

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

const VALID_SEVERITIES = ["low", "medium", "high", "critical"] as const;
const MAX_METADATA_SIZE = 5000;

function extractClientIp(xff: string | null): string | null {
  if (!xff) return null;
  return xff.split(",")[0].trim();
}

export async function logSecurityEvent(params: {
  type: string;
  message: string;

  actorType?: "system" | "admin" | "rider" | "customer" | "unknown";
  actorId?: string | null;
  context?: "delivery" | "payment" | "whatsapp" | "admin" | "rider" | "system";
  operation?: "create" | "update" | "delete" | "access" | null;
  tags?: string[];
  riskScore?: number | null;

  userId?: string | null;
  severity?: (typeof VALID_SEVERITIES)[number];
  ip?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, JsonValue>;
  category?: string | null;
  encryptMetadata?: boolean;
  timestamp?: Date;
  source?: string | null;
  requestId?: string | null;

  orderId?: string | null;
  fulfillmentId?: string | null;
  riderId?: string | null;
}) {
  const eventId = randomUUID();

  const {
    type,
    message,

    actorType = "unknown",
    actorId = null,
    context = "system",
    operation = null,
    tags = [],
    riskScore = null,

    userId = null,
    severity = "low",
    ip,
    userAgent,
    metadata = {},
    category = null,
    encryptMetadata = false,
    timestamp,
    source = null,
    requestId = null,

    orderId = null,
    fulfillmentId = null,
    riderId = null,
  } = params;

  // Normalize severity to lowercase (pagination + filtering consistency)
  const sev = VALID_SEVERITIES.includes(severity)
    ? severity.toLowerCase()
    : "low";

  const normalizedCategory = category?.trim().toLowerCase() || null;

  // Safe metadata handling
  let safeMetadata: Record<string, JsonValue>;
  try {
    safeMetadata = JSON.parse(JSON.stringify(metadata));
  } catch {
    safeMetadata = { _error: "Invalid metadata structure" };
  }

  const json = JSON.stringify(safeMetadata);
  if (json.length > MAX_METADATA_SIZE) {
    safeMetadata = { _truncated: true };
  }

  const storedMetadata = encryptMetadata
    ? {
        _encrypted: true,
        encVersion: 1,
        payload: encrypt(JSON.stringify(safeMetadata)),
      }
    : {
        _encrypted: false,
        encVersion: 1,
        data: safeMetadata,
      };

  // IP + UA extraction
  let detectedIp = ip ?? null;
  let detectedUA = userAgent ?? null;

  try {
    const h = await headers();
    detectedIp = detectedIp ?? extractClientIp(h.get("x-forwarded-for"));
    detectedUA = detectedUA ?? h.get("user-agent");
  } catch {}

  const version = 3;

  try {
    await prisma.securityEvent.create({
      data: {
        id: eventId,
        version,
        type,
        message,
        severity: sev,
        category: normalizedCategory,
        context,
        source,
        requestId,

        actorType,
        actorId,

        orderId,
        fulfillmentId,
        riderId,

        riskScore: riskScore ?? 0,
        tags,

        userId,
        ip: detectedIp,
        userAgent: detectedUA,
        metadata: storedMetadata,
        timestamp: timestamp ?? new Date(),
        createdAt: new Date(),
      },
    });
  } catch (err) {
    console.error("[SecurityEvent] Failed to log event:", err);
  }
}
