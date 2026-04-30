"use client";

import { useCheckout } from "./useCheckout";
import { Loader2 } from "lucide-react";

export default function CheckoutPage() {
  const { state, handleSubmit } = useCheckout();

  const isPending = state.status === "submitting";

  return (
    <form
      action={handleSubmit}
      className="max-w-xl mx-auto px-4 py-10 space-y-10 animate-fadeIn"
      noValidate
    >
      {/* ---------------- Contact Info ---------------- */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-text-primary">
          Contact Information
        </h2>

        <Field
          label="Full Name"
          name="fullName"
          type="text"
          autoComplete="name"
          error={state.errors.fullName}
        />

        <Field
          label="Email Address"
          name="email"
          type="email"
          autoComplete="email"
          error={state.errors.email}
        />

        <Field
          label="Phone Number"
          name="phone"
          type="tel"
          autoComplete="tel"
          error={state.errors.phone}
        />
      </section>

      {/* ---------------- Shipping Info ---------------- */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-text-primary">
          Shipping Details
        </h2>

        <Field
          label="Address"
          name="address"
          type="text"
          autoComplete="street-address"
          error={state.errors.address}
        />

        <Field
          label="City"
          name="city"
          type="text"
          autoComplete="address-level2"
          error={state.errors.city}
        />

        <Field
          label="State"
          name="state"
          type="text"
          autoComplete="address-level1"
          error={state.errors.state}
        />
      </section>

      {/* ---------------- Payment Method ---------------- */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-text-primary">
          Payment Method
        </h2>

        <select
          name="paymentMethod"
          className={`w-full rounded-md border px-3 py-2 text-sm bg-bg-default ${
            state.errors.paymentMethod ? "border-danger" : "border-border"
          }`}
        >
          <option value="paystack">Paystack</option>
          <option value="flutterwave">Flutterwave</option>
          <option value="cod">Cash on Delivery</option>
        </select>

        {state.errors.paymentMethod && (
          <p className="text-danger text-xs">
            {state.errors.paymentMethod.join(", ")}
          </p>
        )}
      </section>

      {/* ---------------- Hidden Fields ---------------- */}
      <input type="hidden" name="items" value={JSON.stringify([])} />
      <input type="hidden" name="shippingType" value="standard" />

      {/* ---------------- Submit Button ---------------- */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-primary text-primary-foreground py-3 font-medium min-h-touch disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        {isPending ? "Processing..." : "Place Order"}
      </button>

      {/* ---------------- Global Error ---------------- */}
      {state.status === "error" && state.message && (
        <p className="text-danger text-sm text-center animate-fadeIn">
          {state.message}
        </p>
      )}
    </form>
  );
}

/* ---------------- Reusable Field Component ---------------- */
function Field({ label, name, type, autoComplete, error }: any) {
  return (
    <div className="space-y-1">
      <label htmlFor={name} className="text-sm font-medium text-text-primary">
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required
        className={`w-full rounded-md border px-3 py-2 text-sm bg-bg-default ${
          error ? "border-danger" : "border-border"
        }`}
      />

      {error && <p className="text-danger text-xs">{error.join(", ")}</p>}
    </div>
  );
}
