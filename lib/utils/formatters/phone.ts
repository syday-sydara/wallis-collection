// lib/utils/formatters/phone.ts

/**
 * Normalize a Nigerian phone number into WhatsApp-safe format:
 *   2348031234567
 *
 * Returns null if the number cannot be normalized.
 */
export function normalizePhoneForWhatsApp(input: string): string | null {
  if (!input) return null;

  // Normalize Unicode and trim
  const raw = input.normalize("NFC").trim();

  // Strip all non-digits
  let digits = raw.replace(/\D/g, "");

  // Handle +2340..., 2340..., 0..., and bare 10-digit numbers
  if (digits.startsWith("2340")) {
    digits = digits.slice(4);
  } else if (digits.startsWith("234")) {
    digits = digits.slice(3);
  } else if (digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  // Nigerian mobile numbers must now be exactly 10 digits
  if (digits.length !== 10) {
    return null;
  }

  // Validate mobile prefix (7, 8, 9)
  if (!/^[789]/.test(digits)) {
    return null;
  }

  // WhatsApp requires digits only, no plus sign
  return `234${digits}`;
}
