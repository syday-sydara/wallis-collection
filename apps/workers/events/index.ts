// events/index.ts

export { Events } from "./events";
export type { EventName } from "./events";
export type { EventPayloads } from "./payloads";

export interface EventEnvelope<E extends EventName = EventName> {
  name: E;
  payload: EventPayloads[E];
  timestamp: Date;
  requestId?: string;
  traceId?: string;
}

export interface EventBus {
  emit<E extends EventName>(event: EventEnvelope<E>): Promise<void>;
}

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
