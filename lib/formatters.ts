/**
 * Format price in cents to NGN currency string
 * @param priceCents Price in cents
 * @returns Formatted price string (e.g., "₦50,000.00")
 */
export const formatPrice = (priceCents: number): string => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(priceCents / 100);
};
