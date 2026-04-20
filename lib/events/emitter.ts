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
    if (size > 5000) return { _truncated: true };
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
    version: 1,
    timestamp: new Date(),
    requestId: globalThis.crypto.randomUUID(),   // ← FIXED
    severity: event.severity ?? "low",
    encryptedMetadata: event.encryptedMetadata ?? false,
    metadata: sanitizeMetadata(event.metadata ?? {}),
  };

  enqueueEvent(enriched);
}
