import { randomUUID } from "crypto";

interface CacheEntry<T> {
  value: Promise<T>;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<any>>();
const TTL = 5 * 60 * 1000; // 5 minutes

export async function withIdempotency<T>(
  key: string,
  fn: () => Promise<T>
): Promise<T> {
  const now = Date.now();
  const existing = store.get(key);

  if (existing && existing.expiresAt > now) {
    return existing.value;
  }

  const promise = fn();

  store.set(key, {
    value: promise,
    expiresAt: now + TTL,
  });

  if (store.size > 1000) {
    for (const [k, entry] of store.entries()) {
      if (entry.expiresAt <= now) store.delete(k);
    }
  }

  return promise;
}

export function generateIdempotencyKey() {
  return randomUUID();
}
