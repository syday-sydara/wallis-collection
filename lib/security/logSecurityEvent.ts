import { prisma } from "@/lib/db";
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

const VALID_SEVERITIES = ["low", "medium", "high"] as const;
const MAX_METADATA_SIZE = 5000;

function extractClientIp(xff: string | null): string | null {
  if (!xff) return null;
  return xff.split(",")[0].trim();
}

export async function logSecurityEvent(params: {
  userId?: string | null;
  type: string;
  message: string;
  severity?: (typeof VALID_SEVERITIES)[number];
  ip?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, JsonValue>;
  category?: string | null;
  encryptMetadata?: boolean;
  timestamp?: Date;
  source?: string | null;
  requestId?: string | null;
}) {
  const eventId = randomUUID();

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
    timestamp,
    source = null,
    requestId = null,
  } = params;

  /* -------------------------------------------------- */
  /* Normalize severity                                  */
  /* -------------------------------------------------- */
  const sev = VALID_SEVERITIES.includes(severity)
    ? severity.toUpperCase()
    : "LOW";

  /* -------------------------------------------------- */
  /* Normalize category                                  */
  /* -------------------------------------------------- */
  const normalizedCategory = category?.trim().toLowerCase() || null;

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
  /* Encryption (v3 standard format)                     */
  /* -------------------------------------------------- */
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

  /* -------------------------------------------------- */
  /* IP + UA extraction                                  */
  /* -------------------------------------------------- */
  let detectedIp = ip ?? null;
  let detectedUA = userAgent ?? null;

  try {
    const h = headers();
    detectedIp = detectedIp ?? extractClientIp(h.get("x-forwarded-for"));
    detectedUA = detectedUA ?? h.get("user-agent");
  } catch {}

  /* -------------------------------------------------- */
  /* Event versioning                                    */
  /* -------------------------------------------------- */
  const version = 1;

  /* -------------------------------------------------- */
  /* Write to DB                                         */
  /* -------------------------------------------------- */
  try {
    await prisma.securityEvent.create({
      data: {
        id: eventId,
        version,
        userId,
        type,
        message,
        severity: sev,
        ip: detectedIp,
        userAgent: detectedUA,
        metadata: storedMetadata,
        category: normalizedCategory,
        source,
        requestId,
        timestamp: timestamp ?? new Date(),
      },
    });
  } catch (err) {
    console.error("[SecurityEvent] Failed to log event:", err);
  }
}
