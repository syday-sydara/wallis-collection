"use client";

import { useState, useTransition } from "react";
import { submitCheckout } from "./actions";
import { checkoutInitialState } from "./state";
import type { CheckoutActionState } from "./state";

export function useCheckout() {
  const [state, setState] = useState<CheckoutActionState>(checkoutInitialState);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    // Generate idempotency key if missing
    if (!formData.get("idempotencyKey")) {
      formData.set("idempotencyKey", crypto.randomUUID());
    }

    startTransition(async () => {
      const next = await submitCheckout(state, formData);
      setState(next);
    });
  }

  return {
    state,
    isPending,
    handleSubmit,
    reset: () => setState(checkoutInitialState),
  };
}