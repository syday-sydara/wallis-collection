export type PaymentMethod = "PAYSTACK" | "MONNIFY"; // extend here later

export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "PAYSTACK", label: "Paystack" },
  { value: "MONNIFY", label: "Monnify" }
];
