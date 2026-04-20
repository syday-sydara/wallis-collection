// lib/utils/formatters/currency.ts

/**
 * Format a number as Nigerian Naira (₦).
 *
 * @param amount - Amount in kobo or naira
 * @param fromKobo - If true, converts kobo to naira (default: true)
 * @param fractionDigits - Number of decimal places (default: 0)
 */
const formatters = new Map<number, Intl.NumberFormat>();

function getFormatter(fractionDigits: number) {
  if (!formatters.has(fractionDigits)) {
    formatters.set(
      fractionDigits,
      new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
      })
    );
  }
  return formatters.get(fractionDigits)!;
}

export function formatCurrency(
  amount: number,
  fromKobo = true,
  fractionDigits = 0
): string {
  if (amount == null) return "₦0";

  // Allow numeric strings
  const numeric = Number(amount);
  if (!Number.isFinite(numeric)) return "₦0";

  const value = fromKobo ? numeric / 100 : numeric;

  const formatter = getFormatter(fractionDigits);
  return formatter.format(value);
}
