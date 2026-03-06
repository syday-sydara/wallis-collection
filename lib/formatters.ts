/**
 * Format price in naira to NGN currency string
 * @param priceNaira Price in naira
 * @returns Formatted price string (e.g., "₦50,000.00")
 */
export const formatPrice = (priceNaira: number): string => {
  if (isNaN(priceNaira)) return "₦0.00";

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(priceNaira);
};