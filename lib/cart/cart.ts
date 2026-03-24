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

export function formatPrice(
  price: number | null | undefined,
  withDecimals = true
) {
  if (typeof price !== "number" || isNaN(price)) return withDecimals ? "₦0.00" : "₦0";
  return withDecimals ? formatterWithDecimals.format(price) : formatterNoDecimals.format(price);
}

export function formatCurrency(amount: number, currency = "NGN", withDecimals = true) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    minimumFractionDigits: withDecimals ? 2 : 0,
    maximumFractionDigits: withDecimals ? 2 : 0,
  }).format(amount);
}