// lib/idempotency.ts

type Entry<T = any> = {
  createdAt: number;
  response: T;
};

/**
 * Time-to-live for idempotency entries (default: 10 minutes)
 */
const IDEMPOTENCY_TTL_MS = 10 * 60_000;

/**
 * In-memory store for idempotent responses
 * NOTE: In production, consider Redis or persistent store for multiple instances
 */
const idempotencyStore = new Map<string, Entry>();

/**
 * Retrieve a cached idempotent response
 */
export function getIdempotentResponse<T = any>(key: string): T | null {
  const entry = idempotencyStore.get(key);
  if (!entry) return null;

  if (Date.now() - entry.createdAt > IDEMPOTENCY_TTL_MS) {
    idempotencyStore.delete(key);
    return null;
  }

  return entry.response as T;
}

/**
 * Save a response for idempotency
 */
export function saveIdempotentResponse<T = any>(key: string, response: T) {
  idempotencyStore.set(key, {
    createdAt: Date.now(),
    response,
  });
}