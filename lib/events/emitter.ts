// lib/events/emitter.ts

import { enqueueEvent } from "@/lib/events/queue/dispatch";
import type { AnyEventInput, EventMetadata } from "@/lib/events/types";
import {
  encryptMetadataForRecord,
  ACTIVE_VERSION,
} from "@/lib/security/crypto";
import { randomUUID } from "crypto";

/* -------------------------------------------------- */
/* Metadata sanitizer                                  */
/* -------------------------------------------------- */

function sanitizeMetadata(meta: EventMetadata = {}): EventMetadata {
  try {
    const cloned = JSON.parse(JSON.stringify(meta));
    const size = JSON.stringify(cloned).length;

    if (size > 5000) {
      return { _truncated: true };
    }

    return cloned;
  } catch {
    return { _error: "Invalid metadata" };
  }
}

/* -------------------------------------------------- */
/* Helpers: inference + normalization                  */
/* -------------------------------------------------- */

const VALID_SEVERITIES = ["low", "medium", "high", "critical"] as const;

function normalizeSeverity(sev?: string) {
  if (!sev) return "low";
  const s = sev.toLowerCase();
  return VALID_SEVERITIES.includes(s as any) ? s : "low";
}

function inferActorType(actorId?: string | null) {
  if (!actorId) return "system";
  return "customer"; // override in callers if needed
}

function inferContext(type: string, category?: string | null) {
  if (category) return category.toLowerCase();
  if (type.startsWith("FRAUD")) return "fraud";
  if (type.startsWith("RISK")) return "risk";
  if (type.startsWith("API_")) return "auth";
  return "system";
}

function inferOperation(type: string) {
  if (type.includes("CREATE")) return "create";
  if (type.includes("UPDATE")) return "update";
  if (type.includes("DELETE")) return "delete";
  if (type.includes("EVALUATION") || type.includes("SCORE")) return "evaluate";
  if (type.includes("SIGNAL") || type.includes("DETECTED")) return "detect";
  return "access";
}

function normalizeTags(tags?: string[]) {
  return (tags ?? []).map((t) => t.trim().toLowerCase());
}

/* -------------------------------------------------- */
/* Unified emitter                                     */
/* -------------------------------------------------- */

export function emitEvent(event: AnyEventInput) {
  const enriched = {
    ...event,

    version: 1,
    timestamp: new Date().toISOString(),

    requestId:
      event.requestId ??
      (typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2)),

    severity: event.severity ?? "low",
    encryptedMetadata: event.encryptedMetadata ?? false,

    metadata: sanitizeMetadata(event.metadata ?? {}),
  };

  enqueueEvent(enriched);
}

/* -------------------------------------------------- */
/* Upgraded v3 Security Event Emitter                  */
/* -------------------------------------------------- */

export function emitSecurityEvent(event: Omit<AnyEventInput, "category"> & { type: string }) {
  const eventId = randomUUID();

  const severity = normalizeSeverity(event.severity);
  const actorType = event.actorType ?? inferActorType(event.actorId ?? event.userId);
  const context = event.context ?? inferContext(event.type, event.category);
  const operation = event.operation ?? inferOperation(event.type);
  const tags = normalizeTags(event.tags);

  const sanitizedMeta = sanitizeMetadata(event.metadata);

  const finalMetadata =
    event.encryptedMetadata
      ? {
          _encrypted: true,
          encVersion: ACTIVE_VERSION,
          payload: encryptMetadataForRecord(eventId, sanitizedMeta),
        }
      : {
          _encrypted: false,
          encVersion: ACTIVE_VERSION,
          data: sanitizedMeta,
        };

  emitEvent({
    ...event,
    type: event.type,
    category: "security",

    severity,
    actorType,
    context,
    operation,
    tags,

    metadata: finalMetadata,
    encryptedMetadata: event.encryptedMetadata ?? false,

    requestId: event.requestId,
  });

  return eventId;
}

/* -------------------------------------------------- */
/* Specialized emitters                                */
/* -------------------------------------------------- */

export function emitAlertEvent(event: Omit<AnyEventInput, "category"> & { type: string }) {
  emitEvent({
    ...event,
    category: "alert",
    severity: event.severity ?? "high",
  });
}

export function emitFraudEvent(event: Omit<AnyEventInput, "category"> & { type: string }) {
  emitEvent({
    ...event,
    category: "fraud",
    severity: event.severity ?? "high",
  });
}
