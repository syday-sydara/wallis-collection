// app/(store)/checkout/actions.ts
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitCheckout, checkoutInitialState } from "./actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/utils";

export default function CheckoutPage() {
  const router = useRouter();
  const [state, setState] = useState(checkoutInitialState);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    // Add idempotency key
    formData.append("idempotencyKey", crypto.randomUUID());

    startTransition(async () => {
      const result = await submitCheckout(state, formData);
      setState(result);

      if (result.success) {
        if (result.paymentUrl) {
          // Redirect to payment provider
          window.location.href = result.paymentUrl;
        } else if (result.orderId) {
          router.push(`/success?orderId=${result.orderId}`);
        }
      }
    });
  };

  const fieldError = (name: string) =>
    state.fieldErrors?.[name]?.[0] ?? null;

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      <h1 className="text-2xl font-semibold">Checkout</h1>

      {state.message && !state.success && (
        <p className="text-danger text-sm">{state.message}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Contact Info */}
        <section className="space-y-4">
          <h2 className="font-medium text-lg">Contact Information</h2>

          <div className="space-y-2">
            <Input
              name="fullName"
              placeholder="Full Name"
              aria-invalid={!!fieldError("fullName")}
            />
            {fieldError("fullName") && (
              <p className="text-danger text-xs">{fieldError("fullName")}</p>
            )}
          </div>

          <div className="space-y-2">
            <Input
              name="email"
              type="email"
              placeholder="Email"
              aria-invalid={!!fieldError("email")}
            />
            {fieldError("email") && (
              <p className="text-danger text-xs">{fieldError("email")}</p>
            )}
          </div>

          <div className="space-y-2">
            <Input
              name="phone"
              placeholder="Phone Number"
              aria-invalid={!!fieldError("phone")}
            />
            {fieldError("phone") && (
              <p className="text-danger text-xs">{fieldError("phone")}</p>
            )}
          </div>
        </section>

        {/* Shipping */}
        <section className="space-y-4">
          <h2 className="font-medium text-lg">Shipping Address</h2>

          <div className="space-y-2">
            <Textarea
              name="address"
              placeholder="Street Address"
              aria-invalid={!!fieldError("address")}
            />
            {fieldError("address") && (
              <p className="text-danger text-xs">{fieldError("address")}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Input
                name="city"
                placeholder="City"
                aria-invalid={!!fieldError("city")}
              />
              {fieldError("city") && (
                <p className="text-danger text-xs">{fieldError("city")}</p>
              )}
            </div>

            <div className="space-y-2">
              <Input
                name="state"
                placeholder="State"
                aria-invalid={!!fieldError("state")}
              />
              {fieldError("state") && (
                <p className="text-danger text-xs">{fieldError("state")}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <select
              name="shippingType"
              className="w-full border rounded-md p-2 bg-surface"
            >
              <option value="STANDARD">Standard Shipping</option>
              <option value="EXPRESS">Express Shipping</option>
            </select>
          </div>
        </section>

        {/* Payment */}
        <section className="space-y-4">
          <h2 className="font-medium text-lg">Payment Method</h2>

          <select
            name="paymentMethod"
            className="w-full border rounded-md p-2 bg-surface"
          >
            <option value="CARD">Pay with Card</option>
          </select>
        </section>

        {/* Cart Snapshot */}
        <input
          type="hidden"
          name="items"
          value={typeof window !== "undefined" ? localStorage.getItem("cart") ?? "[]" : "[]"}
        />

        <Button
          type="submit"
          disabled={isPending}
          className={cn("w-full py-3 text-base")}
        >
          {isPending ? "Processing..." : "Place Order"}
        </Button>
      </form>
    </main>
  );
}