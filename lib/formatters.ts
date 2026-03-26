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

// Cache dynamic formatters
const formatterCache = new Map<string, Intl.NumberFormat>();

function getFormatter(currency: string, withDecimals: boolean) {
  const key = `${currency}-${withDecimals}`;
  if (!formatterCache.has(key)) {
    formatterCache.set(
      key,
      new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency,
        minimumFractionDigits: withDecimals ? 2 : 0,
        maximumFractionDigits: withDecimals ? 2 : 0,
      })
    );
  }
  return formatterCache.get(key)!;
}

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
 * Format integer kobo to Naira currency string
 */
export function formatKobo(
  priceKobo: number,
  withDecimals: boolean = false
): string {
  return formatPrice(priceKobo / 100, withDecimals);
}

/**
 * General currency formatter (cached)
 */
export function formatCurrency(
  amount: number,
  currency: string = "NGN",
  withDecimals: boolean = true
) {
  return getFormatter(currency, withDecimals).format(amount);
}

/**
 * Compact formatter (e.g., ₦1.5M)
 */
export function formatCompact(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    notation: "compact",
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 1,
  }).format(amount);
}

/**
 * Strip currency symbol (e.g., "₦5,000" → "5,000")
 */
export function stripSymbol(formatted: string) {
  return formatted.replace(/[^0-9.,]/g, "");
}
