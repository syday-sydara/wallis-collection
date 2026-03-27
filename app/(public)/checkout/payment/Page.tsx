"use client";

import CheckoutLayout from "@/components/checkout/CheckoutLayout";
import PaymentForm from "@/components/checkout/PaymentForm";

export default function PaymentPage() {
  return (
    <CheckoutLayout>
      <PaymentForm />
    </CheckoutLayout>
  );
}
