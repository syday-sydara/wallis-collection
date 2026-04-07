// lib/risk/context.ts

import type { RiskContext } from "./types";

const FREE_EMAIL_PROVIDERS = [
  "gmail.com",
  "yahoo.com",
  "outlook.com",
  "hotmail.com",
  "icloud.com",
  "live.com",
  "ymail.com",
  "proton.me",
];

const NIGERIA_CARRIER_PREFIXES = ["070", "080", "081", "090", "091"];

function isPrivateIp(ip: string) {
  return (
    ip.startsWith("10.") ||
    ip.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(ip)
  );
}

function extractEmailDomain(email: string): string {
  return email.split("@")[1]?.toLowerCase() ?? "";
}

function extractPhonePrefix(phone: string): string | null {
  if (phone.startsWith("+234")) return "+234";
  return NIGERIA_CARRIER_PREFIXES.find((p) => phone.startsWith(p)) ?? null;
}

export function buildRiskContext(args: {
  ip: string;
  email: string;
  phone: string;
  userAgent: string;

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
  country?: string;
  region?: string;
  city?: string;
  distanceFromLastIpKm?: number;

  // Device
  deviceId?: string | null;
  deviceReputation?: number;
  deviceConfidence?: number;
}): RiskContext {
  const emailDomain = extractEmailDomain(args.email);
  const phonePrefix = extractPhonePrefix(args.phone);

  const isMobile = /Android|iPhone|iPad/i.test(args.userAgent);
  const isBot = /bot|crawl|spider|headless/i.test(args.userAgent);

  return {
    // Identity
    userId: null,
    email: args.email,
    emailDomain,
    phone: args.phone,
    phonePrefix,

    // IP / Geo
    ip: args.ip,
    country: args.country ?? null,
    region: args.region ?? null,
    city: args.city ?? null,
    isPrivateIp: isPrivateIp(args.ip),
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
    userAgent: args.userAgent,
  };
}
