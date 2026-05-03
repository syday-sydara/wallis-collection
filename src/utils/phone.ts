// utils/phone.ts

/**
 * Nigeria‑first phone normalization with validation.
 *
 * Accepts:
 *  - 0803xxxxxxx
 *  - +234803xxxxxxx
 *  - 234803xxxxxxx
 *  - 803xxxxxxx
 *  - 0701 234 5678
 *  - (0803) 123‑4567
 *
 * Returns:
 *  - +234803xxxxxxx
 * or null if invalid
 */
export function normalizePhone(phone: string | undefined | null): string | null {
  if (!phone) return null;

  let p = phone.trim();

  // Remove spaces, hyphens, parentheses
  p = p.replace(/[\s\-()]/g, "");

  // Must contain only digits or leading +
  if (!/^\+?\d+$/.test(p)) return null;

  // Already in +234 format
  if (p.startsWith("+234")) {
    return validateLength(p.slice(1)) ? p : null;
  }

  // 234803xxxxxxx → +234803xxxxxxx
  if (p.startsWith("234")) {
    const rest = p.slice(3);
    return validateLength(rest) ? `+${p}` : null;
  }

  // 0803xxxxxxx → +234803xxxxxxx
  if (p.startsWith("0")) {
    const rest = p.slice(1);
    return validateLength(rest) ? `+234${rest}` : null;
  }

  // 803xxxxxxx → +234803xxxxxxx
  if (/^\d{10}$/.test(p)) {
    return `+234${p}`;
  }

  // Fallback: ensure +
  if (p.startsWith("+")) {
    return validateLength(p.slice(1)) ? p : null;
  }

  // Last fallback
  return null;
}

/**
 * Nigerian numbers must be 10 digits after removing leading 0 or +234.
 */
function validateLength(num: string): boolean {
  return /^\d{10}$/.test(num);
}
