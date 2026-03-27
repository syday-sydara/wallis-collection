"use client";

import CheckoutLayout from "@/components/checkout/CheckoutLayout";
import ShippingForm from "@/components/checkout/ShippingForm";

export default function ShippingPage() {
  return (
    <CheckoutLayout>
      <ShippingForm />
    </CheckoutLayout>
  );
}
