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
  "proton.me"
];

const NIGERIA_CARRIER_PREFIXES = [
  "070", "080", "081", "090", "091"
];

function isPrivateIp(ip: string) {
  return (
    ip.startsWith("10.") ||
    ip.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(ip)
  );
}

export function buildRiskContext(args: {
  ip: string;
  email: string;
  phone: string;
  userAgent: string;
  attempts: number;
  cartValue: number;
  shippingState: string;
}): RiskContext {
  const emailDomain = args.email.split("@")[1]?.toLowerCase() ?? "";
  const isFreeEmail = FREE_EMAIL_PROVIDERS.includes(emailDomain);

  const phoneRegion = args.phone.startsWith("+234")
    ? "+234"
    : NIGERIA_CARRIER_PREFIXES.find((p) => args.phone.startsWith(p)) ?? "unknown";

  const isMobile = /Android|iPhone|iPad/i.test(args.userAgent);
  const isBot = /bot|crawl|spider|headless/i.test(args.userAgent);

  const privateIp = isPrivateIp(args.ip);

  const isBruteForce = args.attempts >= 5;
  const isHighValue = args.cartValue >= 150000; // ₦150k threshold

  return {
    ip: args.ip,
    isPrivateIp: privateIp,

    email: args.email,
    emailDomain,
    isFreeEmail,

    phone: args.phone,
    phoneRegion,

    userAgent: args.userAgent,
    isMobile,
    isBot,

    attempts: args.attempts,
    isBruteForce,

    cartValue: args.cartValue,
    isHighValue,

    shippingState: args.shippingState
  };
}