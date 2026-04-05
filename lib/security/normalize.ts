// lib/security/normalize.ts

/**
 * Normalize phone numbers into a consistent E.164‑like format.
 * This does NOT validate the number — it only cleans it.
 */
export function normalizePhone(input: string | null | undefined): string {
  if (!input) return "";

  // Remove spaces, dashes, parentheses
  let phone = input.replace(/[\s\-()]/g, "");

  // Remove leading zeros
  phone = phone.replace(/^0+/, "");

  // If it starts with +, keep it
  if (phone.startsWith("+")) return phone;

  // If it's Nigerian (example), prepend +234
  if (phone.length === 10 || phone.length === 11) {
    return "+234" + phone.replace(/^0/, "");
  }

  // Fallback: return cleaned number
  return phone;
}

/**
 * Mask email for logging (never log full PII).
 * Example: john.doe@gmail.com → j***@gmail.com
 */
export function maskEmail(email: string | null | undefined): string {
  if (!email || !email.includes("@")) return "unknown";

  const [user, domain] = email.split("@");
  if (!user) return "***@" + domain;

  const maskedUser =
    user.length <= 1 ? "*" : user[0] + "*".repeat(Math.max(1, user.length - 1));

  return `${maskedUser}@${domain}`;
}