import { twMerge } from "tailwind-merge";

// Format NGN currency from kobo or naira
export const formatCurrency = (amount: number, fromKobo = true) => {
  const value = fromKobo ? amount / 100 : amount;

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(value);
};

// Sleep helper
export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Tailwind-aware className merge
export const cn = (...classes: Array<string | undefined | null | false>) =>
  twMerge(classes.filter(Boolean).join(" "));
