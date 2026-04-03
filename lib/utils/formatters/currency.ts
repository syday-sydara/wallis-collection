// lib/utils/formatters/currency.ts

/**
 * Format a number as Nigerian Naira (₦).
 *
 * @param amount - Amount in kobo or naira
 * @param fromKobo - If true, converts kobo to naira (default: true)
 * @param fractionDigits - Number of decimal places (default: 0)
 *
 * @example
 * formatCurrency(150000)            // "₦1,500"
 * formatCurrency(150000, true, 2)   // "₦1,500.00"
 * formatCurrency(1500, false)       // "₦1,500"
 */
export function formatCurrency(
  amount: number,
  fromKobo = true,
  fractionDigits = 0
): string {
  if (!Number.isFinite(amount)) return "₦0";

  // Defensive: ensure non-negative and rounded
  const safeAmount = Math.max(0, amount);
  const value = fromKobo ? safeAmount / 100 : safeAmount;

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits
  }).format(value);
}
