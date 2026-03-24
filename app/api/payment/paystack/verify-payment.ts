// PATH: lib/payments/paystack/verify-payment.ts
// NAME: verify-payment.ts

import { verifyPaystackPayment } from "@/lib/payments/paystack";
import { confirmPayment } from "@/lib/orders/confirm-payment";

export async function processPaystackVerification(reference: string) {
  const result = await verifyPaystackPayment(reference);

  if (result.status !== "success") {
    return null;
  }

  await confirmPayment(result.reference);

  return result.reference;
}