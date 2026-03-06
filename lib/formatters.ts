/**
 * Format price in naira to NGN currency string
 * @param priceNaira Price in naira
 * @param withDecimals Whether to show decimals (default: true)
 * @returns Formatted price string (e.g., "₦50,000.00")
 */
const formatterWithDecimals = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatterNoDecimals = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export const formatPrice = (
  priceNaira: number,
  withDecimals: boolean = true
): string => {
  if (priceNaira == null || isNaN(priceNaira)) return "₦0.00";

  return withDecimals
    ? formatterWithDecimals.format(priceNaira)
    : formatterNoDecimals.format(priceNaira);
};