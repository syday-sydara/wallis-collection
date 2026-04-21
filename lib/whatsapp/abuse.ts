// lib/whatsapp/abuse.ts

type AbuseRecord = {
  count: number;
  lastSeen: number;
  notFoundCount: number;
};

const WINDOW_MS = 60_000; // 1 minute
const MAX_MESSAGES_PER_WINDOW = 20;
const MAX_NOT_FOUND_PER_WINDOW = 5;

const cache = new Map<string, AbuseRecord>();

function getRecord(key: string): AbuseRecord {
  const now = Date.now();
  const rec = cache.get(key);

  if (!rec || now - rec.lastSeen > WINDOW_MS) {
    const fresh: AbuseRecord = { count: 0, lastSeen: now, notFoundCount: 0 };
    cache.set(key, fresh);
    return fresh;
  }

  return rec;
}

export function trackWhatsAppMessage(from: string) {
  const rec = getRecord(from);
  rec.count += 1;
  rec.lastSeen = Date.now();

  return {
    isHighFrequency: rec.count > MAX_MESSAGES_PER_WINDOW,
    count: rec.count,
  };
}

export function trackWhatsAppNotFound(from: string) {
  const rec = getRecord(from);
  rec.notFoundCount += 1;
  rec.lastSeen = Date.now();

  return {
    isSuspicious: rec.notFoundCount > MAX_NOT_FOUND_PER_WINDOW,
    notFoundCount: rec.notFoundCount,
  };
}
