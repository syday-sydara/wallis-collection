// lib/security/whatsapp/rate.ts

// naive in-memory tracker; replace with Redis in prod
const windowMs = 60_000;
const store = new Map<string, { count: number; windowStart: number }>();

export function trackWhatsAppMessage(from: string) {
  const now = Date.now();
  const existing = store.get(from);

  if (!existing || now - existing.windowStart > windowMs) {
    store.set(from, { count: 1, windowStart: now });
    return { count: 1, isHighFrequency: false, windowMs };
  }

  existing.count += 1;
  const isHighFrequency = existing.count >= 40;

  return { count: existing.count, isHighFrequency, windowMs };
}
