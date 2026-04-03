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
 * In-memory store for idempotent responses.
 * NOTE: For multi-instance deployments, replace with Redis or a shared store.
 */
const idempotencyStore = new Map<string, Entry>();

/**
 * Internal helper to check if an entry is expired.
 */
function isExpired(entry: Entry): boolean {
  return Date.now() - entry.createdAt > IDEMPOTENCY_TTL_MS;
}

/**
 * Retrieve a cached idempotent response.
 * Automatically cleans up expired entries.
 */
export function getIdempotentResponse<T = any>(key: string): T | null {
  const entry = idempotencyStore.get(key);
  if (!entry) return null;

  if (isExpired(entry)) {
    idempotencyStore.delete(key);
    return null;
  }

  return entry.response as T;
}

/**
 * Save a response for idempotency.
 * Overwrites any existing entry for the same key.
 */
export function saveIdempotentResponse<T = any>(key: string, response: T) {
  idempotencyStore.set(key, {
    createdAt: Date.now(),
    response
  });
}

/**
 * Optional: Clean up expired entries to prevent memory growth.
 * Useful if your server handles many idempotent operations.
 */
export function cleanupIdempotencyStore() {
  const now = Date.now();
  for (const [key, entry] of idempotencyStore.entries()) {
    if (now - entry.createdAt > IDEMPOTENCY_TTL_MS) {
      idempotencyStore.delete(key);
    }
  }
}
