"use client";

import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import CheckoutProgress from "@/components/checkout/CheckoutProgress";
import { useCheckout } from "./checkoutProvider";
import { useCart } from "@/components/cart/CartProvider";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PaymentForm() {
  const { payment, setPayment } = useCheckout();
  const { items, total } = useCart();
  const router = useRouter();

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContinue = () => {
    // Reset the error before validating
    setError("");

    // Validate Payment Method
    if (!payment.method) {
      setError("Please select a payment method");
      return;
    }

    // If Paystack or Monnify is selected, validate card fields
    if (payment.method === "PAYSTACK" || payment.method === "MONNIFY") {
      if (payment.method === "PAYSTACK" && (!payment.cardNumber || !payment.expiry || !payment.cvv)) {
        setError("Please fill in all card details.");
        return;
      }
      // Monnify doesn’t require card details, so we don’t need to validate them here
    }

    setIsSubmitting(true);

    // Proceed to review page after validation
    setTimeout(() => {
      router.push("/checkout/review");
    }, 500); // Simulating network delay if needed, you can replace this with an API call
  };

  return (
    <div className="space-y-12">
      <CheckoutProgress step={3} />

      <h1 className="heading-1 text-primary">Payment</h1>

      <Card className="space-y-6 p-6">
        {/* Payment Method */}
        <div className="space-y-2">
          <label className="text-sm text-primary font-medium">Payment Method</label>
          <select
            value={payment.method || ""}
            onChange={(e) => setPayment({ method: e.target.value as any })}
            className="w-full px-4 py-2 rounded-lg border border-neutral/30 text-sm focus:ring-2 focus:ring-primary/40 outline-none"
          >
            <option value="">Select a payment method</option>
            <option value="PAYSTACK">Paystack</option>
            <option value="MONNIFY">Monnify</option>
            <option value="COD">Cash on Delivery</option>
          </select>
        </div>

        {/* Card Fields (only if card-based method is selected) */}
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
          <div className="p-4 bg-neutral/10 rounded-lg text-sm text-neutral">
            You will be redirected to Monnify to complete your bank transfer.
          </div>
        )}

        {/* Pay on Delivery Info */}
        {payment.method === "COD" && (
          <div className="p-4 bg-neutral/10 rounded-lg text-sm text-neutral">
            You will pay in cash when your order is delivered.
          </div>
        )}

        {/* Error Message */}
        {error && <p className="text-danger text-sm">{error}</p>}

        {/* Continue Button */}
        <Button
          className="w-full mt-4"
          onClick={handleContinue}
          disabled={isSubmitting} // Disable while submitting
        >
          {isSubmitting ? "Processing..." : "Review Order"}
        </Button>
      </Card>
    </div>
  );
}