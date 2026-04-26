// lib/whatsapp/abuse.ts

type AbuseRecord = {
  count: number;
  notFoundCount: number;
  lastSeen: number;
};

const WINDOW_MS = 60_000; // 1 minute
const MAX_MESSAGES_PER_WINDOW = 20;
const MAX_NOT_FOUND_PER_WINDOW = 5;

const cache = new Map<string, AbuseRecord>();

function getRecord(key: string): AbuseRecord {
  const now = Date.now();
  const rec = cache.get(key);

  // Reset window if expired or missing
  if (!rec || now - rec.lastSeen > WINDOW_MS) {
    const fresh: AbuseRecord = {
      count: 0,
      notFoundCount: 0,
      lastSeen: now,
    };
    cache.set(key, fresh);
    return fresh;
  }

  return rec;
}

/* -------------------------------------------------- */
/* Track message frequency                             */
/* -------------------------------------------------- */
export function trackWhatsAppMessage(from: string) {
  const rec = getRecord(from);
  rec.count += 1;
  rec.lastSeen = Date.now();

  return {
    isHighFrequency: rec.count > MAX_MESSAGES_PER_WINDOW,
    count: rec.count,
  };
}

/* -------------------------------------------------- */
/* Track "not found" events (invalid commands, etc.)   */
/* -------------------------------------------------- */
export function trackWhatsAppNotFound(from: string) {
  const rec = getRecord(from);
  rec.notFoundCount += 1;
  rec.lastSeen = Date.now();

  return {
    isSuspicious: rec.notFoundCount > MAX_NOT_FOUND_PER_WINDOW,
    notFoundCount: rec.notFoundCount,
  };
}

/* -------------------------------------------------- */
/* Unified abuse status helper                         */
/* -------------------------------------------------- */
export function getAbuseStatus(from: string) {
  const rec = getRecord(from);

  return {
    highFrequency: rec.count > MAX_MESSAGES_PER_WINDOW,
    suspicious: rec.notFoundCount > MAX_NOT_FOUND_PER_WINDOW,
    count: rec.count,
    notFoundCount: rec.notFoundCount,
    lastSeen: rec.lastSeen,
  };
}

/* -------------------------------------------------- */
/* Optional: periodic cleanup to prevent memory leaks  */
/* -------------------------------------------------- */
export function cleanupAbuseCache() {
  const now = Date.now();
  for (const [key, rec] of cache.entries()) {
    if (now - rec.lastSeen > WINDOW_MS * 2) {
      cache.delete(key);
    }
  }
}
