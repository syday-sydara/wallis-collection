"use client";

import { useState, useTransition } from "react";
import { submitCheckout } from "./actions";
import { checkoutInitialState } from "./state";
import type { CheckoutActionState } from "./state";

export function useCheckout() {
  const [state, setState] = useState<CheckoutActionState>(checkoutInitialState);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    // Ensure idempotency key exists
    if (!formData.get("idempotencyKey")) {
      formData.set("idempotencyKey", crypto.randomUUID());
    }

    startTransition(async () => {
      try {
        const next = await submitCheckout(formData);

        setState(next);

        // Redirect to payment gateway
        if (next.paymentUrl) {
          window.location.href = next.paymentUrl;
          return;
        }

        // Redirect to success page
        if (next.redirectUrl) {
          window.location.href = next.redirectUrl;
          return;
        }

        // Auto-reset on success (no redirect)
        if (next.status === "success") {
          setTimeout(() => setState(checkoutInitialState), 200);
        }
      } catch (err) {
        console.error("Checkout failed:", err);

        setState({
          ...checkoutInitialState,
          status: "error",
          message: "Something went wrong. Please try again.",
        });
      }
    });
  }

  // Optional programmatic submit helper
  function submit(data: Record<string, any>) {
    const formData = new FormData();
    Object.entries(data).forEach(([k, v]) => formData.set(k, String(v)));
    return handleSubmit(formData);
  }

  return {
    state,
    isPending,
    handleSubmit,
    submit,
    reset: () => setState(checkoutInitialState),
  };
}
