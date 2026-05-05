// events/index.ts

// Core event map
export { Events } from "./events";

// Types
export type { EventName, EventPayloads } from "./payloads";

// Envelope for all events
export interface EventEnvelope<E extends EventName = EventName> {
  name: E;
  payload: EventPayloads[E];
  timestamp: Date;
  requestId?: string;
  traceId?: string;
}

// Type‑safe event emitter interface
export interface EventBus {
  emit<E extends EventName>(event: EventEnvelope<E>): Promise<void>;
}

// Helper to build a typed event envelope
export function createEvent<E extends EventName>(
  name: E,
  payload: EventPayloads[E],
  meta?: { requestId?: string; traceId?: string }
): EventEnvelope<E> {
  return {
    name,
    payload,
    timestamp: new Date(),
    ...meta,
  };
}
