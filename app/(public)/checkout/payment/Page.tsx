"use client";

import PaymentForm from "@/components/checkout/PaymentForm";
import { useCart } from "@/components/cart/CartProvider";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function PaymentPage() {
  const { items, total, isEmpty } = useCart();

  // Prevent accessing /checkout/payment with an empty cart
  if (isEmpty) {
    return (
      <div className="text-center py-20 space-y-6">
        <h1 className="heading-2 text-primary">Your cart is empty</h1>
        <p className="text-neutral">Add items to your cart before proceeding to payment.</p>
        <Link href="/products">
          <Button variant="primary">Browse Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="text-center space-y-2">
        <h1 className="heading-1 text-primary">Payment</h1>
        <p className="text-neutral">Complete your order securely</p>
      </div>

      {/* Order Summary */}
      <div className="p-6 border rounded-lg bg-[var(--color-bg-surface)] space-y-4">
        <h2 className="heading-3 text-primary">Order Summary</h2>

        {items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span>
              {item.name} × {item.quantity}
            </span>
            <span>₦{(item.price * item.quantity).toLocaleString()}</span>
          </div>
        ))}

        <div className="flex justify-between text-lg font-semibold border-t pt-4">
          <span>Total</span>
          <span>₦{total.toLocaleString()}</span>
        </div>
      </div>

      {/* Payment Form */}
      <PaymentForm />
    </div>
  );
}
