// lib/security/normalize.ts

import { startSpan, metricsWithContext, log } from "@/lib/core";

function safeNormalize<T>(name: string, fn: () => T, fallback: T): T {
  const span = startSpan(`normalize.${name}`);

  try {
    const result = fn();
    span.end({ success: true });
    return result;
  } catch (err: any) {
    metricsWithContext.increment(`normalize.${name}.errors`);
    log.warn(`Normalization failed: ${name}`, {
      error: err?.message ?? String(err),
    });
    span.end({ success: false, error: err?.message });
    return fallback;
  }
}

function capLength(str: string, max: number) {
  return str.length > max ? str.slice(0, max) : str;
}

export function normalizePhone(input: string | null | undefined): string {
  return safeNormalize("phone", () => {
    if (!input) return "";

    let phone = input.replace(/[^\d+]/g, "");
    phone = capLength(phone, 32);

    if (phone.startsWith("+")) return phone;

    if (/^\d{10,11}$/.test(phone)) {
      phone = phone.replace(/^0/, "");
      return "+234" + phone;
    }

    return phone;
  }, "");
}

export function maskEmail(email: string | null | undefined): string {
  return safeNormalize("email", () => {
    if (!email || !email.includes("@")) return "unknown";

    const trimmed = email.trim().toLowerCase();
    const [user, domain] = trimmed.split("@");
    if (!domain) return "unknown";

    const safeUser =
      !user || user.length === 0
        ? "*"
        : user.length === 1
        ? "*"
        : user[0] + "*".repeat(Math.min(user.length - 1, 20));

    return `${safeUser}@${domain}`;
  }, "unknown");
}

export function normalizeIp(ip: string | null | undefined): string | null {
  return safeNormalize("ip", () => {
    if (!ip) return null;

    let cleaned = ip.trim();

    cleaned = cleaned.replace(/^

\[|\]

$/g, ""); // fixed
    cleaned = cleaned.replace(/%.+$/, "");
    cleaned = cleaned.replace(/:\d+$/, "");

    if (cleaned.includes(",")) {
      cleaned = cleaned.split(",")[0].trim();
    }

    cleaned = capLength(cleaned, 64);

    return cleaned || null;
  }, null);
}

export function normalizeUserAgent(
  ua: string | null | undefined
): string | null {
  return safeNormalize("userAgent", () => {
    if (!ua) return null;

    let cleaned = ua.trim().replace(/\s+/g, " ");
    cleaned = capLength(cleaned, 300);

    return cleaned;
  }, null);
}

export function normalizeDeviceId(id: string | null | undefined): string | null {
  return safeNormalize("deviceId", () => {
    if (!id) return null;

    let cleaned = id.trim().toLowerCase();
    cleaned = capLength(cleaned, 128);

    return cleaned;
  }, null);
}

export function safeString(input: string | null | undefined): string {
  return safeNormalize("string", () => {
    if (!input) return "";

    let cleaned = input.replace(/[\x00-\x1F\x7F]/g, "").trim();
    cleaned = capLength(cleaned, 500);

    return cleaned;
  }, "");
}
