// producers/audit.producer.ts
import { auditQueue } from "../queues/domain/audit.queue";
import { Events } from "../events";
import type { EventName, EventPayloads } from "../events/payloads";

/**
 * AuditProducer
 *
 * Responsibilities:
 * - Emit audit events into the audit queue
 * - Enforce deterministic jobId (logId)
 * - Guarantee type‑safe event emission
 */
export const AuditProducer = {
  /**
   * Generic typed emitter
   */
  async emit<E extends EventName>(
    event: E,
    payload: EventPayloads[E]
  ) {
    const jobId =
      (payload as any).logId ??
      `${event}-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    await auditQueue.add(event, payload, {
      jobId,
      removeOnComplete: true,
      removeOnFail: false, // keep failed audit jobs for debugging
    });
  },

  /**
   * Convenience wrapper for audit.created
   */
  created(logId: string) {
    return this.emit(Events.AUDIT_LOG_CREATED, {
      logId,
      timestamp: new Date(),
    });
  },
};
