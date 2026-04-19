// lib/idempotency.ts

type Entry<T = any> = {
  createdAt: number;
  value: T | typeof NULL_SENTINEL;
};

type InFlight = {
  promise: Promise<any>;
  createdAt: number;
};

const TTL_MS = 10 * 60_000; // 10 minutes
const MAX_ENTRIES = 5000;
const NULL_SENTINEL = Symbol("NULL_VALUE");

const store = new Map<string, Entry>();
const inFlight = new Map<string, InFlight>();

function normalizeKey(key: string) {
  return key.trim().replace(/\s+/g, "_");
}

function isExpired(entry: { createdAt: number }) {
  return Date.now() - entry.createdAt > TTL_MS;
}

export function getIdempotentResponse<T>(key: string): T | null {
  const normalized = normalizeKey(key);
  const entry = store.get(normalized);
  if (!entry) return null;

  if (isExpired(entry)) {
    store.delete(normalized);
    return null;
  }

  return entry.value === NULL_SENTINEL ? null : (entry.value as T);
}

export function saveIdempotentResponse<T>(key: string, value: T) {
  const normalized = normalizeKey(key);

  // Evict oldest if needed (O(1))
  if (store.size >= MAX_ENTRIES) {
    const oldestKey = store.keys().next().value;
    if (oldestKey) store.delete(oldestKey);
  }

  store.set(normalized, {
    createdAt: Date.now(),
    value: value === null ? NULL_SENTINEL : value,
  });
}

export async function runIdempotent<T>(
  key: string,
  fn: () => Promise<T>,
  timeoutMs = 30_000
): Promise<T> {
  const normalized = normalizeKey(key);

  // 1. Cached response
  const cached = getIdempotentResponse<T>(normalized);
  if (cached !== null) return cached;

  // 2. In-flight response
  const existing = inFlight.get(normalized);
  if (existing && !isExpired(existing)) {
    return existing.promise as Promise<T>;
  }

  // 3. Start new computation with timeout
  const promise = Promise.race([
    fn(),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Idempotent operation timed out")), timeoutMs)
    ),
  ])
    .then((result) => {
      saveIdempotentResponse(normalized, result);
      inFlight.delete(normalized);
      return result;
    })
    .catch((err) => {
      inFlight.delete(normalized);
      throw err;
    });

  inFlight.set(normalized, { promise, createdAt: Date.now() });

  return promise;
}

export function cleanupIdempotencyStore() {
  const now = Date.now();

  for (const [key, entry] of store.entries()) {
    if (now - entry.createdAt > TTL_MS) {
      store.delete(key);
    }
  }

  for (const [key, entry] of inFlight.entries()) {
    if (now - entry.createdAt > TTL_MS) {
      inFlight.delete(key);
    }
  }
}
