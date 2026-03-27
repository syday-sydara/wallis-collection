"use client";

import CheckoutLayout from "@/components/checkout/CheckoutLayout";
import OrderReview from "@/components/checkout/OrderReview";

export default function ReviewPage() {
  return (
    <CheckoutLayout>
      <OrderReview />
    </CheckoutLayout>
  );
}
