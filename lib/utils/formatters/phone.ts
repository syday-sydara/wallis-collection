/**
 * Format Nigerian phone numbers into a consistent international format.
 *
 * Examples:
 *  - 0803 123 4567      => +234 803 123 4567
 *  - +2348031234567     => +234 803 123 4567
 *  - 2348031234567      => +234 803 123 4567
 *  - 8031234567         => +234 803 123 4567
 *
 * Returns the original input if the number cannot be normalized.
 */
export function formatPhoneNumber(input: string): string {
  if (!input) return "";

  // Strip all non‑digits
  let digits = input.replace(/\D/g, "");

  // Normalize prefixes
  if (digits.startsWith("234")) {
    digits = digits.slice(3);
  } else if (digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  // Nigerian mobile numbers should now be exactly 10 digits
  const NIGERIAN_NUMBER_LENGTH = 10;
  if (digits.length !== NIGERIAN_NUMBER_LENGTH) {
    return input.trim(); // fallback gracefully
  }

  // Format: +234 XXX XXX XXXX
  return `+234 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
}
