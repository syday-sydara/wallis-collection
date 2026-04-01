export const PAYMENT_METHODS = [
  { value: "PAYSTACK", label: "Paystack" },
  { value: "MONNIFY", label: "Monnify" }
] as const;

export type PaymentMethod = typeof PAYMENT_METHODS[number]["value"];