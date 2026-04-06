"use client";

import { useCheckout } from "./useCheckout";

export default function CheckoutPage() {
  const { state, isPending, handleSubmit } = useCheckout();

  return (
    <form
      action={handleSubmit}
      className="space-y-6"
    >
      <input name="fullName" />
      {state.fieldErrors.fullName && (
        <p className="text-red-500 text-sm">{state.fieldErrors.fullName}</p>
      )}

      <input name="email" />
      {state.fieldErrors.email && (
        <p className="text-red-500 text-sm">{state.fieldErrors.email}</p>
      )}

      {/* ...other fields... */}

      <button
        type="submit"
        disabled={isPending}
        className="btn-primary"
      >
        {isPending ? "Processing..." : "Place Order"}
      </button>

      {state.message && (
        <p className="text-sm text-red-500">{state.message}</p>
      )}
    </form>
  );
}