// lib/formatters.ts

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

/**
 * Format price in Naira to NGN currency string
 */
export function formatPrice(
  priceNaira: number | null | undefined,
  withDecimals: boolean = true
): string {
  if (typeof priceNaira !== "number" || isNaN(priceNaira)) {
    return withDecimals ? "₦0.00" : "₦0";
  }

  return withDecimals
    ? formatterWithDecimals.format(priceNaira)
    : formatterNoDecimals.format(priceNaira);
}

/**
 * Optional: general currency formatter
 */
export function formatCurrency(
  amount: number,
  currency: string = "NGN",
  withDecimals: boolean = true
) {
  const formatter = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    minimumFractionDigits: withDecimals ? 2 : 0,
    maximumFractionDigits: withDecimals ? 2 : 0,
  });

  return formatter.format(amount);
}