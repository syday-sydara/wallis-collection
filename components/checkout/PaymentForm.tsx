"use client";

import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import CheckoutProgress from "@/components/checkout/CheckoutProgress";
import { useCheckout } from "./checkoutProvider";
import { useCart } from "@/components/cart/CartProvider";
import { useRouter } from "next/navigation";
import { useState } from "react";
import clsx from "clsx";

export default function PaymentForm() {
  const { payment, setPayment } = useCheckout();
  const { items, total } = useCart();
  const router = useRouter();

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContinue = () => {
    setError("");

    if (!payment.method) {
      setError("Please select a payment method");
      return;
    }

    if (payment.method === "PAYSTACK") {
      if (!payment.cardNumber || !payment.expiry || !payment.cvv) {
        setError("Please fill in all card details.");
        return;
      }
    }

    setIsSubmitting(true);

    setTimeout(() => {
      router.push("/checkout/review");
    }, 500);
  };

  return (
    <div className="space-y-12">
      <CheckoutProgress step={3} />

      <h1 className="heading-1 text-[var(--color-text-primary)]">Payment</h1>

      <Card className="space-y-6 p-6">
        {/* Payment Method */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--color-text-primary)]">
            Payment Method
          </label>

          <select
            value={payment.method || ""}
            onChange={(e) => setPayment({ method: e.target.value as any })}
            className={clsx(
              "w-full px-4 py-2 rounded-[var(--radius-md)] text-sm outline-none",
              "border border-[var(--color-border)] bg-[var(--color-bg-surface)]",
              "focus:ring-2 focus:ring-[var(--color-primary)]/40 transition"
            )}
          >
            <option value="">Select a payment method</option>
            <option value="PAYSTACK">Paystack</option>
            <option value="MONNIFY">Monnify</option>
            <option value="COD">Cash on Delivery</option>
          </select>
        </div>

        {/* Card Fields */}
        {payment.method === "PAYSTACK" && (
          <>
            <Input
              label="Card Number"
              value={payment.cardNumber || ""}
              onChange={(e) => setPayment({ cardNumber: e.target.value })}
              placeholder="1234 5678 9012 3456"
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Expiry"
                value={payment.expiry || ""}
                onChange={(e) => setPayment({ expiry: e.target.value })}
                placeholder="MM/YY"
              />
              <Input
                label="CVV"
                value={payment.cvv || ""}
                onChange={(e) => setPayment({ cvv: e.target.value })}
                placeholder="123"
              />
            </div>
          </>
        )}

        {/* Bank Transfer Info */}
        {payment.method === "MONNIFY" && (
          <div className="p-4 rounded-[var(--radius-md)] text-sm bg-[var(--color-border)]/20 text-[var(--color-text-secondary)]">
            You will be redirected to Monnify to complete your bank transfer.
          </div>
        )}

        {/* Cash on Delivery Info */}
        {payment.method === "COD" && (
          <div className="p-4 rounded-[var(--radius-md)] text-sm bg-[var(--color-border)]/20 text-[var(--color-text-secondary)]">
            You will pay in cash when your order is delivered.
          </div>
        )}

        {/* Error Message */}
        {error && (
          <p className="text-sm text-[var(--color-danger-500)]">{error}</p>
        )}

        {/* Continue Button */}
        <Button
          className="w-full mt-4"
          onClick={handleContinue}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Processing..." : "Review Order"}
        </Button>
      </Card>
    </div>
  );
}
