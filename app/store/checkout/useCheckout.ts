"use client";

import { useState, useTransition } from "react";
import { submitCheckout } from "./actions";
import { checkoutInitialState } from "./state";
import type { CheckoutActionState } from "./state";

export function useCheckout() {
  const [state, setState] = useState<CheckoutActionState>(checkoutInitialState);
  const [isPending, startTransition] = useTransition();

  /* ---------------------------------------------
   * Helpers for clean state transitions
   * --------------------------------------------- */
  function setSubmitting() {
    setState((prev) => ({
      ...prev,
      status: "submitting",
      message: null,
      errors: {},
      timestamp: Date.now(),
    }));
  }

  function setError(message: string, errors: Record<string, string[] | undefined> = {}) {
    setState({
      status: "error",
      message,
      errors,
      timestamp: Date.now(),
    });
  }

  function setSuccess(next: CheckoutActionState) {
    setState({
      ...next,
      status: "success",
      timestamp: Date.now(),
    });
  }

  /* ---------------------------------------------
   * Main submit handler
   * --------------------------------------------- */
  async function handleSubmit(formData: FormData) {
    // Ensure idempotency key exists
    if (!formData.get("idempotencyKey")) {
      formData.set("idempotencyKey", crypto.randomUUID());
    }

    setSubmitting();

    startTransition(async () => {
      try {
        const next = await submitCheckout(formData);

        // Normalize missing fields
        const normalized: CheckoutActionState = {
          ...checkoutInitialState,
          ...next,
          timestamp: Date.now(),
        };

        // Handle redirects
        if (normalized.paymentUrl) {
          window.location.href = normalized.paymentUrl;
          return;
        }

        if (normalized.redirectUrl) {
          window.location.href = normalized.redirectUrl;
          return;
        }

        // Success without redirect
        if (normalized.status === "success") {
          setSuccess(normalized);

          // Auto-reset after a short delay
          setTimeout(() => setState(checkoutInitialState), 300);
          return;
        }

        // Error state
        if (normalized.status === "error") {
          setError(normalized.message ?? "Checkout failed.", normalized.errors);
          return;
        }

        // Fallback
        setState(normalized);
      } catch (err) {
        console.error("Checkout failed:", err);

        setError("Something went wrong. Please try again.");
      }
    });
  }

  /* ---------------------------------------------
   * Programmatic submit helper
   * --------------------------------------------- */
  function submit(data: Record<string, any>) {
    const formData = new FormData();
    Object.entries(data).forEach(([k, v]) => formData.set(k, String(v)));
    return handleSubmit(formData);
  }

  return {
    state,
    isPending: isPending || state.status === "submitting",
    handleSubmit,
    submit,
    reset: () => setState(checkoutInitialState),
  };
}
