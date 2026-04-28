// lib/whatsapp/abuse.ts

import { redis, redisKey, redisSafe } from "@/lib/redis";
import { emitSecurityEvent } from "@/lib/events/emitter";
import { EventSource } from "@/lib/events/types";

const WINDOW_MS = 60_000; // 1 minute
const MAX_MESSAGES_PER_WINDOW = 20;
const MAX_NOT_FOUND_PER_WINDOW = 5;
const COOLDOWN_MS = 2 * 60_000;

type AbuseRecord = {
  count: number;
  notFoundCount: number;
  lastSeen: number;
  cooldownUntil?: number;
};

function key(from: string) {
  return redisKey("abuse", from);
}

async function loadRecord(from: string): Promise<AbuseRecord> {
  const now = Date.now();

  const rec = await redisSafe(
    () => redis.get<AbuseRecord>(key(from)),
    null
  );

  if (!rec || now - rec.lastSeen > WINDOW_MS) {
    const fresh: AbuseRecord = {
      count: 0,
      notFoundCount: 0,
      lastSeen: now,
    };
    await redisSafe(() => redis.set(key(from), fresh), null);
    return fresh;
  }

  return rec;
}

async function saveRecord(from: string, rec: AbuseRecord) {
  await redisSafe(() => redis.set(key(from), rec), null);
}

/* -------------------------------------------------- */
/* Track message frequency                             */
/* -------------------------------------------------- */
export async function trackWhatsAppMessage(from: string) {
  const rec = await loadRecord(from);

  rec.count += 1;
  rec.lastSeen = Date.now();

  const isHighFrequency = rec.count > MAX_MESSAGES_PER_WINDOW;

  if (isHighFrequency && !rec.cooldownUntil) {
    rec.cooldownUntil = Date.now() + COOLDOWN_MS;

    emitSecurityEvent({
      kind: "security",
      type: "WHATSAPP_ABUSE_RATE_LIMIT",
      message: `High-frequency messaging detected from ${from}`,
      severity: "medium",
      tags: ["whatsapp", "abuse", "rate_limit"],
      metadata: { from, count: rec.count },
      source: EventSource.WhatsAppAPI,
    });
  }

  await saveRecord(from, rec);

  return { isHighFrequency, count: rec.count };
}

/* -------------------------------------------------- */
/* Track invalid commands                              */
/* -------------------------------------------------- */
export async function trackWhatsAppNotFound(from: string) {
  const rec = await loadRecord(from);

  rec.notFoundCount += 1;
  rec.lastSeen = Date.now();

  const isSuspicious = rec.notFoundCount > MAX_NOT_FOUND_PER_WINDOW;

  if (isSuspicious && !rec.cooldownUntil) {
    rec.cooldownUntil = Date.now() + COOLDOWN_MS;

    emitSecurityEvent({
      kind: "security",
      type: "WHATSAPP_ABUSE_INVALID_COMMANDS",
      message: `Suspicious invalid commands from ${from}`,
      severity: "medium",
      tags: ["whatsapp", "abuse", "invalid_commands"],
      metadata: { from, notFoundCount: rec.notFoundCount },
      source: EventSource.WhatsAppAPI,
    });
  }

  await saveRecord(from, rec);

  return { isSuspicious, notFoundCount: rec.notFoundCount };
}

/* -------------------------------------------------- */
/* Check cooldown                                       */
/* -------------------------------------------------- */
export async function isUserInCooldown(from: string) {
  const rec = await loadRecord(from);
  return rec.cooldownUntil && rec.cooldownUntil > Date.now();
}

/* -------------------------------------------------- */
/* Unified abuse status                                 */
/* -------------------------------------------------- */
export async function getAbuseStatus(from: string) {
  const rec = await loadRecord(from);

  return {
    highFrequency: rec.count > MAX_MESSAGES_PER_WINDOW,
    suspicious: rec.notFoundCount > MAX_NOT_FOUND_PER_WINDOW,
    cooldown: rec.cooldownUntil && rec.cooldownUntil > Date.now(),
    count: rec.count,
    notFoundCount: rec.notFoundCount,
    lastSeen: rec.lastSeen,
  };
}
