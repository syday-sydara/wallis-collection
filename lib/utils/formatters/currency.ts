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
) {
  const key = `${locale}-${currency}-${fractionDigits}`;

  if (!formatterCache.has(key)) {
    formatterCache.set(
      key,
      new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
      })
    );
  }

  return formatterCache.get(key)!;
}

export function formatCurrency(
  amount: number,
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
