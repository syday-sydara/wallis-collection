// app/(store)/checkout/page.tsx
"use client";

import { useFormState, useFormStatus } from "react-dom";
import Field from "@/components/forms/Field";
import { toast } from "@/components/ui/toast";
import { getShippingPreview } from "@/lib/checkout/shipping";
import { useCheckoutForm } from "./useCheckoutForm";
import { submitCheckout, checkoutInitialState } from "./actions";
import { NIGERIAN_STATES } from "@/lib/checkout/constants";
import { PAYMENT_METHODS } from "@/lib/payment/methods";

export default function CheckoutPage() {
  const [state, formAction] = useFormState(submitCheckout, checkoutInitialState);

  const {
    form,
    update,
    validateClient,
    mergedErrors,
    errorRefs,
    saving,
    clearForm
  } = useCheckoutForm(state.fieldErrors);

  const shippingPreview = getShippingPreview(form.state, form.shippingType);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validateClient()) return;

    const fd = new FormData(e.currentTarget);
    fd.append("items", JSON.stringify([{ productId: "demo-product-id", quantity: 1 }]));
    formAction(fd);
  }

  if (state.success === true && state.orderId && !state.paymentUrl) {
    toast("Order created successfully. Redirecting…", "success");
  } else if (state.success === false && state.message) {
    toast(state.message, "error");
  }

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Checkout</h1>
        <p className="text-sm text-gray-600">
          Enter your details to complete your order.
        </p>
        {saving && <p className="text-xs text-gray-400">Saving your details…</p>}
      </header>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Field
          label="Full name"
          name="fullName"
          defaultValue={form.fullName}
          onChange={(v) => update("fullName", v)}
          error={mergedErrors.fullName}
          ref={(el) => (errorRefs.current.fullName = el)}
          required
        />

        <Field
          label="Email"
          name="email"
          type="email"
          defaultValue={form.email}
          onChange={(v) => update("email", v)}
          error={mergedErrors.email}
          ref={(el) => (errorRefs.current.email = el)}
          required
        />

        <Field
          label="Phone"
          name="phone"
          defaultValue={form.phone}
          onChange={(v) => update("phone", v)}
          error={mergedErrors.phone}
          helper="Use a valid Nigerian number (e.g. 080..., +234...)"
          ref={(el) => (errorRefs.current.phone = el)}
          required
        />

        <Field
          label="Address"
          name="address"
          as="textarea"
          defaultValue={form.address}
          onChange={(v) => update("address", v)}
          error={mergedErrors.address}
          ref={(el) => (errorRefs.current.address = el)}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field
            label="City"
            name="city"
            defaultValue={form.city}
            onChange={(v) => update("city", v)}
            error={mergedErrors.city}
            ref={(el) => (errorRefs.current.city = el)}
            required
          />

          <div className="space-y-1" ref={(el) => (errorRefs.current.state = el)}>
            <label className="text-sm font-medium">State</label>
            <select
              name="state"
              className="w-full rounded-md border px-3 py-2 text-sm"
              defaultValue={form.state}
              onChange={(e) => update("state", e.target.value)}
              required
            >
              <option value="">Select state</option>
              {NIGERIAN_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            {mergedErrors.state && (
              <p className="text-xs text-red-600">{mergedErrors.state}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Shipping</label>
            <select
              name="shippingType"
              className="w-full rounded-md border px-3 py-2 text-sm"
              defaultValue={form.shippingType}
              onChange={(e) => update("shippingType", e.target.value as any)}
            >
              <option value="STANDARD">Standard</option>
              <option value="EXPRESS">Express</option>
            </select>
          </div>
        </div>

        {shippingPreview && (
          <div className="text-sm text-gray-700 space-y-1">
            <p>
              Shipping cost:{" "}
              <span className="font-medium">
                ₦{shippingPreview.cost.toLocaleString()}
              </span>
            </p>
            <p className="text-xs text-gray-500">
              Estimated delivery: {shippingPreview.eta}
            </p>
          </div>
        )}

        <PaymentMethodSelect form={form} update={update} />

        <div className="flex items-center gap-3">
          <SubmitButton />
          <button
            type="button"
            onClick={clearForm}
            className="text-xs text-gray-500 underline underline-offset-4"
          >
            Clear form
          </button>
        </div>
      </form>
    </div>
  );
}

function PaymentMethodSelect({ form, update }: any) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">Payment method</label>
      <select
        name="paymentMethod"
        className="w-full rounded-md border px-3 py-2 text-sm"
        defaultValue={form.paymentMethod}
        onChange={(e) => update("paymentMethod", e.target.value)}
      >
        {PAYMENT_METHODS.map((m) => (
          <option key={m.value} value={m.value}>
            {m.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center gap-2 rounded-md bg-[--brand-600] text-white px-4 py-2 text-sm font-medium disabled:opacity-60"
    >
      {pending && (
        <span className="h-4 w-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
      )}
      {pending ? "Processing..." : "Complete order"}
    </button>
  );
}
