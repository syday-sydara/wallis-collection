// utils/phone.ts

/**
 * Nigeria‑first phone normalization with strict validation.
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

  // +234803xxxxxxx
  if (p.startsWith("+234")) {
    const rest = p.slice(4);
    return isValidNigeriaMobile(rest) ? p : null;
  }

  // 234803xxxxxxx
  if (p.startsWith("234")) {
    const rest = p.slice(3);
    return isValidNigeriaMobile(rest) ? `+${p}` : null;
  }

  // 0803xxxxxxx
  if (p.startsWith("0")) {
    const rest = p.slice(1);
    return isValidNigeriaMobile(rest) ? `+234${rest}` : null;
  }

  // 803xxxxxxx
  if (/^\d{10}$/.test(p)) {
    return isValidNigeriaMobile(p) ? `+234${p}` : null;
  }

  // +803xxxxxxx (invalid)
  if (p.startsWith("+")) return null;

  return null;
}

/**
 * Nigerian mobile numbers must:
 *  - be exactly 10 digits
 *  - start with 7, 8, or 9
 *  - second digit must be 0–1 or 3–9 (valid operator prefixes)
 */
function isValidNigeriaMobile(num: string): boolean {
  if (!/^\d{10}$/.test(num)) return false;

  const first = num[0];
  const second = num[1];

  if (!["7", "8", "9"].includes(first)) return false;

  // Valid second digits: 0–1, 3–9
  if (!/[0-1 3-9]/.test(second)) return false;

  return true;
}
