// lib/utils/formatters/currency.ts

/**
 * Format a number as Nigerian Naira (₦)
 * @param amount Amount in kobo or naira
 * @param fromKobo If true, converts kobo to naira (default: true)
 * @param fractionDigits Number of decimal places (default: 0)
 * @returns Formatted currency string, e.g. "₦1,000"
 */
export const formatCurrency = (
  amount: number,
  fromKobo = true,
  fractionDigits = 0
): string => {
  if (!Number.isFinite(amount)) return "₦0";

  const value = fromKobo ? amount / 100 : amount;

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
};