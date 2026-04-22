// lib/security/normalize.ts

/**
 * Normalize phone numbers into a consistent E.164-like format.
 * This does NOT validate the number — it only cleans and standardizes it.
 */
export function normalizePhone(input: string | null | undefined): string {
  if (!input) return "";

  // Remove spaces, dashes, parentheses, dots
  let phone = input.replace(/[\s\-().]/g, "");

  // Remove non-numeric except leading +
  phone = phone.replace(/(?!^\+)[^\d]/g, "");

  // If it starts with +, assume it's already international
  if (phone.startsWith("+")) return phone;

  // Nigerian numbers (10 or 11 digits)
  if (/^\d{10,11}$/.test(phone)) {
    phone = phone.replace(/^0/, "");
    return "+234" + phone;
  }

  // Fallback: return cleaned digits
  return phone;
}

/**
 * Mask email for logging (never log full PII).
 * Examples:
 *   john.doe@gmail.com → j***@gmail.com
 *   a@domain.com → *@domain.com
 */
export function maskEmail(email: string | null | undefined): string {
  if (!email || !email.includes("@")) return "unknown";

  const [user, domain] = email.split("@");

  if (!user || user.length === 0) return `***@${domain}`;

  const maskedUser =
    user.length === 1 ? "*" : user[0] + "*".repeat(user.length - 1);

  return `${maskedUser}@${domain}`;
}

/**
 * Normalize IP addresses for logging.
 * Removes ports, trims whitespace, handles IPv6 brackets.
 */
export function normalizeIp(ip: string | null | undefined): string | null {
  if (!ip) return null;

  let cleaned = ip.trim();

  // Remove IPv6 brackets
  cleaned = cleaned.replace(/^

\[|\]

$/g, "");

  // Remove port suffix (:12345)
  cleaned = cleaned.replace(/:\d+$/, "");

  // Handle multiple forwarded IPs
  if (cleaned.includes(",")) {
    cleaned = cleaned.split(",")[0].trim();
  }

  return cleaned || null;
}

/**
 * Normalize user-agent strings for logging.
 * Removes excessive whitespace and truncates extremely long values.
 */
export function normalizeUserAgent(ua: string | null | undefined): string | null {
  if (!ua) return null;

  const cleaned = ua.trim().replace(/\s+/g, " ");

  // Hard cap to prevent log bloat
  return cleaned.length > 300 ? cleaned.slice(0, 300) + "…" : cleaned;
}

/**
 * Normalize device fingerprints (if you ever store them).
 * Lowercase + strip whitespace.
 */
export function normalizeDeviceId(id: string | null | undefined): string | null {
  if (!id) return null;
  return id.trim().toLowerCase();
}

/**
 * Generic safe string sanitizer for logs.
 * Removes control characters and trims.
 */
export function safeString(input: string | null | undefined): string {
  if (!input) return "";
  return input.replace(/[\x00-\x1F\x7F]/g, "").trim();
}
