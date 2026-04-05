// lib/idempotency.ts

type Entry<T = any> = {
  createdAt: number;
  response: T;
};

type InFlight = {
  promise: Promise<any>;
  createdAt: number;
};

const IDEMPOTENCY_TTL_MS = 10 * 60_000;
const MAX_ENTRIES = 5000;

const store = new Map<string, Entry>();
const inFlight = new Map<string, InFlight>();

function isExpired(entry: { createdAt: number }) {
  return Date.now() - entry.createdAt > IDEMPOTENCY_TTL_MS;
}

export function getIdempotentResponse<T = any>(key: string): T | null {
  const entry = store.get(key);
  if (!entry) return null;

  if (isExpired(entry)) {
    store.delete(key);
    return null;
  }

  return entry.response as T;
}

export function saveIdempotentResponse<T = any>(key: string, response: T) {
  if (store.size >= MAX_ENTRIES) {
    // Simple eviction: remove oldest entry
    const oldest = [...store.entries()].sort(
      (a, b) => a[1].createdAt - b[1].createdAt
    )[0];
    if (oldest) store.delete(oldest[0]);
  }

  store.set(key, {
    createdAt: Date.now(),
    response
  });
}

/**
 * Ensures only one execution happens per key.
 * If another request is already computing the value, this waits for it.
 */
export async function runIdempotent<T>(
  key: string,
  fn: () => Promise<T>
): Promise<T> {
  // 1. Return cached response if available
  const cached = getIdempotentResponse<T>(key);
  if (cached !== null) return cached;

  // 2. If computation is in-flight, wait for it
  const existing = inFlight.get(key);
  if (existing && !isExpired(existing)) {
    return existing.promise as Promise<T>;
  }

  // 3. Start new computation
  const promise = fn()
    .then((result) => {
      saveIdempotentResponse(key, result);
      inFlight.delete(key);
      return result;
    })
    .catch((err) => {
      inFlight.delete(key);
      throw err;
    });

  inFlight.set(key, { promise, createdAt: Date.now() });

  return promise;
}

/**
 * Optional: periodic cleanup
 */
export function cleanupIdempotencyStore() {
  const now = Date.now();

  for (const [key, entry] of store.entries()) {
    if (now - entry.createdAt > IDEMPOTENCY_TTL_MS) {
      store.delete(key);
    }
  }

  for (const [key, entry] of inFlight.entries()) {
    if (now - entry.createdAt > IDEMPOTENCY_TTL_MS) {
      inFlight.delete(key);
    }
  }
}