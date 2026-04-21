// lib/risk/context.ts

import type { RiskContext } from "./types";

/* -------------------------------------------------- */
/* Constants                                           */
/* -------------------------------------------------- */

const FREE_EMAIL_PROVIDERS = new Set([
  "gmail.com",
  "yahoo.com",
  "outlook.com",
  "hotmail.com",
  "icloud.com",
  "live.com",
  "ymail.com",
  "proton.me",
]);

const NIGERIA_CARRIER_PREFIXES = ["070", "080", "081", "090", "091"];

/* -------------------------------------------------- */
/* Helpers                                             */
/* -------------------------------------------------- */

function normalizeIp(ip?: string | null): string {
  if (!ip) return "unknown";

  let value = ip.trim();

  // IPv6-mapped IPv4
  if (value.startsWith("::ffff:")) {
    value = value.replace("::ffff:", "");
  }

  // Remove port if present
  if (value.includes(":") && value.includes(".")) {
    value = value.split(":")[0];
  }

  return value;
}

function isPrivateIp(ip: string): boolean {
  return (
    ip.startsWith("10.") ||
    ip.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(ip)
  );
}

function extractEmailDomain(email?: string | null): string {
  if (!email) return "";
  return email.split("@")[1]?.toLowerCase().trim() ?? "";
}

function extractPhonePrefix(phone?: string | null): string | null {
  if (!phone) return null;

  const cleaned = phone.replace(/[\s()-]/g, "");

  if (cleaned.startsWith("+234")) return "+234";

  return (
    NIGERIA_CARRIER_PREFIXES.find((p) => cleaned.startsWith(p)) ?? null
  );
}

function normalizeUserAgent(ua?: string | null): string {
  return ua?.trim() || "unknown";
}

/* -------------------------------------------------- */
/* Main Builder                                        */
/* -------------------------------------------------- */

export function buildRiskContext(args: {
  ip?: string | null;
  email?: string | null;
  phone?: string | null;
  userAgent?: string | null;

  userId?: string | null;

  // Behavior
  sessionVelocity?: number;
  permissionDenials?: number;
  failedLogins?: number;
  ipVelocity?: number;
  routeVelocity?: number;

  // Transaction
  amount?: number;
  previousOrderAmount?: number;
  orderVelocity?: number;

  // Geo
  country?: string | null;
  region?: string | null;
  city?: string | null;
  distanceFromLastIpKm?: number;

  // Device
  deviceId?: string | null;
  deviceReputation?: number;
  deviceConfidence?: number;
}): RiskContext {
  const normalizedIp = normalizeIp(args.ip);
  const emailDomain = extractEmailDomain(args.email);
  const phonePrefix = extractPhonePrefix(args.phone);
  const ua = normalizeUserAgent(args.userAgent);

  const isMobile = /Android|iPhone|iPad/i.test(ua);
  const isBot = /bot|crawl|spider|headless|selenium|puppeteer/i.test(ua);

  return {
    // Identity
    userId: args.userId ?? null,
    email: args.email ?? null,
    emailDomain,
    isFreeEmail: FREE_EMAIL_PROVIDERS.has(emailDomain),
    phone: args.phone ?? null,
    phonePrefix,

    // IP / Geo
    ip: normalizedIp,
    isPrivateIp: isPrivateIp(normalizedIp),
    country: args.country ?? null,
    region: args.region ?? null,
    city: args.city ?? null,
    distanceFromLastIpKm: args.distanceFromLastIpKm ?? null,

    // Device Intelligence
    deviceId: args.deviceId ?? null,
    deviceReputation: args.deviceReputation ?? 100,
    deviceConfidence: args.deviceConfidence ?? 100,
    isMobile,
    isBot,

    // Behavior Intelligence
    sessionVelocity: args.sessionVelocity ?? 0,
    permissionDenials: args.permissionDenials ?? 0,
    failedLogins: args.failedLogins ?? 0,
    ipVelocity: args.ipVelocity ?? 0,
    routeVelocity: args.routeVelocity ?? 0,

    // Transaction / Order
    amount: args.amount ?? null,
    previousOrderAmount: args.previousOrderAmount ?? null,
    orderVelocity: args.orderVelocity ?? null,

    // Risk Engine
    riskScore: 0,
    triggeredRules: [],

    // User Agent
    userAgent: ua,
  };
}
