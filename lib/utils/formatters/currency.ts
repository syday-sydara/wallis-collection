/**
 * Format Nigerian Naira currency (₦) from kobo or naira.
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