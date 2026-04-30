// lib/utils/formatters/phone.ts

/**
 * Normalize a phone number into WhatsApp-ready format:
 *   2348012345678
 *
 * Accepts:
 * - +234 801 234 5678
 * - 2348012345678
 * - 08012345678
 * - 8012345678
 *
 * Returns null if the number cannot be normalized safely.
 */
export function normalizePhoneForWhatsApp(
  input: string,
  strict: boolean = false,
): string | null {
  if (!input) return null;

  // Normalize Unicode and strip all non-digits
  const digits = input.normalize("NFC").replace(/\D/g, "");

  // Already in correct WhatsApp format
  if (digits.startsWith("234") && digits.length === 13) {
    return digits;
  }

  // +234 or 234 prefix but wrong length
  if (digits.startsWith("234")) {
    if (digits.length === 14) {
      // e.g., "23408012345678" → remove extra 0
      return digits.replace(/^2340/, "234");
    }
    return strict ? null : digits; // fallback
  }

  // Local NG number starting with 0 (e.g., 08012345678)
  if (digits.length === 11 && digits.startsWith("0")) {
    return `234${digits.slice(1)}`;
  }

  // Local NG number without leading 0 (e.g., 8012345678)
  if (digits.length === 10) {
    return `234${digits}`;
  }

  // If strict mode is off, allow fallback for 13+ digit numbers
  if (!strict && digits.length >= 10) {
    return digits.startsWith("0")
      ? `234${digits.slice(1)}`
      : digits.startsWith("234")
        ? digits
        : `234${digits}`;
  }

  return null;
}
