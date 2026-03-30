// lib/idempotency.ts

type Entry = {
  createdAt: number;
  response: any;
};

const IDEMPOTENCY_TTL_MS = 10 * 60_000;
const idempotencyStore = new Map<string, Entry>();

export function getIdempotentResponse(key: string) {
  const entry = idempotencyStore.get(key);
  if (!entry) return null;

  if (Date.now() - entry.createdAt > IDEMPOTENCY_TTL_MS) {
    idempotencyStore.delete(key);
    return null;
  }

  return entry.response;
}

export function saveIdempotentResponse(key: string, response: any) {
  idempotencyStore.set(key, {
    createdAt: Date.now(),
    response
  });
}
