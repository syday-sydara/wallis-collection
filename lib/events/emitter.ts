import crypto from "crypto";
import { logEvent } from "@/lib/events/pipeline";
import {
  AnyEventInput,
  EventMetadata,
  EventSeverity,
} from "@/lib/events/types";

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
/* Unified emitter                                     */
/* -------------------------------------------------- */

export async function emitEvent(event: AnyEventInput) {
  const severity: EventSeverity = event.severity ?? "low";

  const enriched = {
    ...event,
    version: 1,
    timestamp: new Date(),
    requestId: crypto.randomUUID(),
    severity,
    encryptedMetadata: event.encryptedMetadata ?? false,
    metadata: sanitizeMetadata(event.metadata ?? {}),
  };

  return logEvent(enriched);
}
