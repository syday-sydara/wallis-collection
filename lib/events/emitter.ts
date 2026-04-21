// lib/events/emitter.ts

import { enqueueEvent } from "@/lib/events/queue/dispatch";
import type { AnyEventInput, EventMetadata } from "@/lib/events/types";

/* -------------------------------------------------- */
/* Metadata sanitizer                                  */
/* -------------------------------------------------- */

function sanitizeMetadata(meta: EventMetadata = {}): EventMetadata {
  try {
    const cloned = JSON.parse(JSON.stringify(meta));
    const size = JSON.stringify(cloned).length;

    // Hard limit to prevent log bloat or DB overflow
    if (size > 5000) {
      return { _truncated: true };
    }

    return cloned;
  } catch {
    return { _error: "Invalid metadata" };
  }
}

/* -------------------------------------------------- */
/* Unified emitter                                     */
/* -------------------------------------------------- */

export function emitEvent(event: AnyEventInput) {
  const enriched = {
    ...event,

    // Versioning for future migrations
    version: 1,

    // ISO timestamp (matches pipeline schema)
    timestamp: new Date().toISOString(),

    // Always generate a requestId if missing
    requestId:
      event.requestId ??
      (typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2)),

    // Default severity
    severity: event.severity ?? "low",

    // Default metadata encryption flag
    encryptedMetadata: event.encryptedMetadata ?? false,

    // Sanitized metadata
    metadata: sanitizeMetadata(event.metadata ?? {}),
  };

  enqueueEvent(enriched);
}
