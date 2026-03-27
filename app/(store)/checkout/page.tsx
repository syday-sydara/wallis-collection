"use client";

import { useFormState, useFormStatus } from "react-dom";
import Field from "@/components/forms/Field";
import { toast } from "@/components/ui/toast";
import { getShippingPreview } from "@/lib/checkout/shipping";
import { useCheckoutForm } from "./useCheckoutForm";
import { submitCheckout } from "./actions";
import { NIGERIAN_STATES } from "@/lib/checkout/constants";

const initialState = {
  success: null,
  message: null,
  fieldErrors: {}
};

export default function CheckoutPage() {
  const [state, formAction] = useFormState(submitCheckout, initialState);

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

  function handleSubmit(e: any) {
    e.preventDefault();
    if (!validateClient()) return;

    const fd = new FormData(e.target);
    fd.append("items", JSON.stringify([{ productId: "demo-product-id", quantity: 1 }]));
    formAction(fd);
  }

  if (state.success === true) {
    toast("Order created successfully", "success");
  }

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Checkout</h1>
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

          <div ref={(el) => (errorRefs.current.state = el)}>
            <label className="text-sm font-medium">State</label>
            <select
              name="state"
              className="w-full rounded-md border px-3 py-2 text-sm"
              defaultValue={form.state}
              onChange={(e) => update("state", e.target.value)}
            >
              <option value="">Select state</option>
              {NIGERIAN_STATES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            {mergedErrors.state && (
              <p className="text-xs text-red-600">{mergedErrors.state}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Shipping</label>
            <select
              name="shippingType"
              className="w-full rounded-md border px-3 py-2 text-sm"
              defaultValue={form.shippingType}
              onChange={(e) => update("shippingType", e.target.value)}
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
              <strong>₦{shippingPreview.cost.toLocaleString()}</strong>
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
            className="text-xs text-gray-500 underline"
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
    <div>
      <label className="text-sm font-medium">Payment method</label>
      <select
        name="paymentMethod"
        className="w-full rounded-md border px-3 py-2 text-sm"
        defaultValue={form.paymentMethod}
        onChange={(e) => update("paymentMethod", e.target.value)}
      >
        <option value="PAYSTACK">Paystack</option>
        <option value="MONNIFY">Monnify</option>
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
