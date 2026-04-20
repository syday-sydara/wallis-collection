import crypto from "crypto";
import { enqueueEvent } from "@/lib/events/queue/dispatch";
import { EventInput, EventMetadata, EventSeverity } from "@/lib/events/types";

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

export async function emitEvent(event: EventInput<any, any>) {
  const enriched = {
    ...event,
    version: 1,
    timestamp: new Date(),
    requestId: crypto.randomUUID(),
    severity: event.severity ?? "low",
    encryptedMetadata: event.encryptedMetadata ?? false,
    metadata: sanitizeMetadata(event.metadata ?? {}),
  };

  enqueueEvent(enriched);
}
