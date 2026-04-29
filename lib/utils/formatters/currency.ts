// lib/utils/formatters/currency.ts

/**
 * Format a number as Nigerian Naira (₦).
 *
 * @param amount - Amount in kobo or naira
 * @param fromKobo - If true, converts kobo to naira (default: true)
 * @param fractionDigits - Number of decimal places (default: 0)
 * @param locale - Optional locale override (default: "en-NG")
 */

const formatterCache = new Map<string, Intl.NumberFormat>();

function getFormatter(
  fractionDigits: number,
  locale = "en-NG",
  currency = "NGN"
): Intl.NumberFormat {
  const key = `${locale}-${currency}-${fractionDigits}`;

  let formatter = formatterCache.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    });
    formatterCache.set(key, formatter);
  }

  return formatter;
}

export function formatCurrency(
  amount: number | string | null | undefined,
  fromKobo = true,
  fractionDigits = 0,
  locale = "en-NG"
): string {
  if (amount == null) return "₦0";

  const numeric = Number(amount);
  if (!Number.isFinite(numeric)) return "₦0";

  const value = fromKobo ? numeric / 100 : numeric;

  const formatter = getFormatter(fractionDigits, locale);
  return formatter.format(value);
}

/**
 * Convenience helper for formatting NGN specifically.
 *
 * @example
 * formatNGN(150000) // "₦1,500"
 */
export function formatNGN(
  amount: number | string | null | undefined,
  fromKobo = true,
  fractionDigits = 0
): string {
  return formatCurrency(amount, fromKobo, fractionDigits, "en-NG");
}
