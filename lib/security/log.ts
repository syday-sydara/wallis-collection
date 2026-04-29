// lib/security/log.ts

import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { randomUUID } from "crypto";

import {
  encryptMetadataForRecord,
  ACTIVE_VERSION,
} from "@/lib/security/crypto";

import {
  normalizeIp,
  normalizeUserAgent,
  safeString,
} from "@/lib/security/normalize";

import {
  serviceContext,
  startSpan,
  metricsWithContext,
  log,
} from "@/lib/core";

/* -------------------------------------------------- */
/* Types                                               */
/* -------------------------------------------------- */

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

const VALID_SEVERITIES = ["low", "medium", "high", "critical"] as const;
const MAX_METADATA_SIZE = 5000;

/* -------------------------------------------------- */
/* Helpers                                             */
/* -------------------------------------------------- */

function normalizeSeverity(sev?: string) {
  if (!sev) return "low";
  const s = sev.toLowerCase();
  return VALID_SEVERITIES.includes(s as any) ? s : "low";
}

function sanitizeMetadata(input: Record<string, JsonValue>) {
  try {
    const cloned = JSON.parse(JSON.stringify(input));
    const json = JSON.stringify(cloned);
    if (json.length > MAX_METADATA_SIZE) {
      return { _truncated: true };
    }
    return cloned;
  } catch {
    return { _error: "Invalid metadata structure" };
  }
}

/* -------------------------------------------------- */
/* Main Function                                       */
/* -------------------------------------------------- */

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
  severity?: string;
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
    severity,
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

  const sev = normalizeSeverity(severity);
  const normalizedCategory = category ? safeString(category).toLowerCase() : null;
  const normalizedTags = tags.map((t) => safeString(t).toLowerCase());

  /* -------------------------------------------------- */
  /* Observability Context                               */
  /* -------------------------------------------------- */

  const ctx = serviceContext.get();

  const span = startSpan("security.log_event", {
    eventId,
    type,
    severity: sev,
    actorType,
    actorId,
    context,
    operation,
    category: normalizedCategory,
    requestId: requestId ?? ctx.requestId,
    traceId: ctx.traceId,
  });

  metricsWithContext.increment("security.events.total");
  metricsWithContext.increment(`security.events.type.${type}`);
  metricsWithContext.increment(`security.events.severity.${sev}`);

  /* -------------------------------------------------- */
  /* Metadata sanitization                               */
  /* -------------------------------------------------- */

  const safeMetadata = sanitizeMetadata(metadata);

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

  let detectedIp = normalizeIp(ip) ?? null;
  let detectedUA = normalizeUserAgent(userAgent) ?? null;

  try {
    const h = await headers();
    detectedIp = detectedIp ?? normalizeIp(h.get("x-forwarded-for"));
    detectedUA = detectedUA ?? normalizeUserAgent(h.get("user-agent"));
  } catch {
    // headers() unavailable (background job, queue worker, etc.)
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
        requestId: requestId ?? ctx.requestId,

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

    span.end({ success: true });
  } catch (err: any) {
    metricsWithContext.increment("security.events.write_error");

    log.error("Failed to write security event", {
      eventId,
      type,
      severity: sev,
      error: err?.message ?? String(err),
      stack: err?.stack,
    });

    span.end({
      success: false,
      error: err?.message ?? "Unknown error",
    });
  }
}
