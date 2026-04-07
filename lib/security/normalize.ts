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
    // Remove leading zero if present
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

  // Mask everything except the first character
  const maskedUser =
    user.length === 1 ? "*" : user[0] + "*".repeat(user.length - 1);

  return `${maskedUser}@${domain}`;
}
