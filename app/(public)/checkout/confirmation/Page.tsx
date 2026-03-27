"use client";

import CheckoutLayout from "@/components/checkout/CheckoutLayout";
import OrderConfirmationClient from "@/components/checkout/OrderConfirmation";

export default function ConfirmationPage({ order }) {
  return (
    <CheckoutLayout>
      <OrderConfirmationClient order={order} />
    </CheckoutLayout>
  );
}
