// app/checkout/page.tsx

"use client";

import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import CheckoutProgress from "@/components/checkout/CheckoutProgress";

export default function CheckoutPage() {
  const router = useRouter();

  const goToNextStep = (step: number) => {
    switch (step) {
      case 1:
        router.push("/checkout/shipping");
        break;
      case 2:
        router.push("/checkout/payment");
        break;
      case 3:
        router.push("/checkout/review");
        break;
      default:
        router.push("/checkout/confirmation");
    }
  };

  return (
    <div className="space-y-12 py-10">
      <CheckoutProgress step={1} />

      <h1 className="heading-1 text-[var(--color-text-primary)]">
        Checkout
      </h1>

      <div className="space-y-4 max-w-xl">
        <p className="text-[var(--color-text-secondary)] leading-relaxed">
          You are about to complete your order. Follow the steps to confirm your
          shipping and payment details.
        </p>

        <Button onClick={() => goToNextStep(1)} className="w-full">
          Start Checkout
        </Button>
      </div>
    </div>
  );
}
