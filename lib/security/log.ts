// lib/security/log.ts
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import {
  encryptMetadataForRecord,
  ACTIVE_VERSION,
} from "@/lib/security/crypto";
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
  context?: string;
  operation?: string;
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
    operation = "access",
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

  /* -------------------------------------------------- */
  /* Normalize severity                                  */
  /* -------------------------------------------------- */
  const sev = VALID_SEVERITIES.includes(severity)
    ? severity.toLowerCase()
    : "low";

  /* -------------------------------------------------- */
  /* Normalize category                                  */
  /* -------------------------------------------------- */
  const normalizedCategory = category?.trim().toLowerCase() || null;

  /* -------------------------------------------------- */
  /* Normalize tags                                      */
  /* -------------------------------------------------- */
  const normalizedTags = tags.map((t) => t.trim().toLowerCase());

  /* -------------------------------------------------- */
  /* Metadata sanitization                               */
  /* -------------------------------------------------- */
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

  /* -------------------------------------------------- */
  /* Encrypt metadata (AAD-bound to eventId)             */
  /* -------------------------------------------------- */
  const storedMetadata = encryptMetadata
    ? {
        _encrypted: true,
        encVersion: ACTIVE_VERSION,
        payload: encryptMetadataForRecord(eventId, safeMetadata),
      }
    : {
        _encrypted: false,
        encVersion: ACTIVE_VERSION,
        data: safeMetadata,
      };

  /* -------------------------------------------------- */
  /* IP + UA extraction                                  */
  /* -------------------------------------------------- */
  let detectedIp = ip ?? null;
  let detectedUA = userAgent ?? null;

  try {
    const h = await headers();
    detectedIp = detectedIp ?? extractClientIp(h.get("x-forwarded-for"));
    detectedUA = detectedUA ?? h.get("user-agent");
  } catch {
    // headers() unavailable (e.g. background job)
  }

  /* -------------------------------------------------- */
  /* Write to DB                                         */
  /* -------------------------------------------------- */
  try {
    await prisma.securityEvent.create({
      data: {
        id: eventId,
        version: 3,

        type,
        message,
        severity: sev,
        category: normalizedCategory,
        context,
        operation,
        source,
        requestId,

        actorType,
        actorId,

        orderId,
        fulfillmentId,
        riderId,

        riskScore: riskScore ?? 0,
        tags: normalizedTags,

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
