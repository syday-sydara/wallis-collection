// app/(store)/checkout/page.tsx
"use client";

import { useFormState, useFormStatus } from "react-dom";
import { toast } from "@/components/ui/Toast";
import { submitCheckout } from "./actions";
import { useCheckoutForm } from "@/lib/checkout/useCheckoutForm";
import CartSummary from "@/components/cart/CartSummary";
import Field from "@/components/forms/Field";
import { NIGERIAN_STATES } from "@/lib/checkout/constants";
import { PAYMENT_METHODS } from "@/lib/payment/verification";
import { formatCurrency } from "@/lib/utils/index";
import { useCart } from "@/lib/cart/store";
import type { CartItem } from "@/lib/cart/types";

// WhatsApp helpers
import {
  generateWhatsAppMessage,
  generateWhatsAppLink,
} from "@/lib/utils/whatsapp";

export default function CheckoutPage() {
  // -------------------- Form & Cart --------------------
  const [state, formAction] = useFormState(submitCheckout, {});
  const { pending } = useFormStatus();

  const { cart, updateQuantity, removeItem } = useCart();
  const cartItems: CartItem[] = cart.items;

  const {
    form,
    update,
    shippingPreview,
    validateClient,
    mergedErrors,
    errorRefs,
    saving,
    clearForm,
  } = useCheckoutForm(state.fieldErrors);

  const cartTotal =
    cartItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0) +
    (shippingPreview?.cost || 0);

  // -------------------- Handlers --------------------
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!validateClient()) return;

    const fd = new FormData(e.currentTarget);
    fd.append(
      "items",
      JSON.stringify(
        cartItems.map((i: CartItem) => ({
          productId: i.id,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        }))
      )
    );

    formAction(fd);
  }

  function handleQuantityChange(id: string, qty: number) {
    updateQuantity(id, qty);
  }

  function handleRemove(id: string) {
    removeItem(id);
  }

  // -------------------- Feedback --------------------
  if (state.success === true && state.orderId && !state.paymentUrl) {
    toast("Order created successfully. Redirecting…", "success");
  } else if (state.success === false && state.message) {
    toast(state.message, "error");
  }

  // -------------------- Payment Helper --------------------
  function PaymentMethodUI() {
    switch (form.paymentMethod) {
      case "PAYSTACK":
        return (
          <p className="text-sm text-text-muted">Pay via Paystack securely.</p>
        );
      case "MONNIFY":
        return (
          <p className="text-sm text-text-muted">Pay via Monnify securely.</p>
        );
      default:
        return null;
    }
  }

  return (
    <div className="p-4 max-w-xl mx-auto space-y-6 md:space-y-10">
      {/* Header */}
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Checkout</h1>
        <p className="text-sm text-text-muted">
          Enter your details to complete your order.
        </p>
        {(saving || pending) && (
          <p className="text-xs text-text-muted">Saving your details…</p>
        )}
      </header>

      {/* Cart Summary */}
      <CartSummary
        items={cartItems}
        shippingCost={shippingPreview?.cost}
        onQuantityChange={handleQuantityChange}
        onRemove={handleRemove}
      />

      {/* Checkout Form */}
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Full name */}
        <Field
          label="Full name"
          name="fullName"
          defaultValue={form.fullName}
          onChange={(v) => update("fullName", v)}
          error={mergedErrors.fullName}
          ref={(el) => (errorRefs.current.fullName = el)}
          required
        />

        {/* Email */}
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

        {/* Phone */}
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

        {/* Address */}
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

        {/* City, State, Shipping */}
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

          <div
            className="space-y-1"
            ref={(el) => (errorRefs.current.state = el)}
          >
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
              onChange={(e) => update("shippingType", e.target.value)}
            >
              <option value="STANDARD">Standard</option>
              <option value="EXPRESS">Express</option>
            </select>
          </div>
        </div>

        {/* Shipping preview */}
        {shippingPreview && (
          <div className="text-sm text-text space-y-1">
            <p>
              Shipping cost:{" "}
              <span className="font-medium">
                {formatCurrency(shippingPreview.cost)}
              </span>
            </p>
            <p className="text-xs text-text-muted">
              Estimated delivery: {shippingPreview.eta}
            </p>
          </div>
        )}

        {/* Payment Method */}
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
          <PaymentMethodUI />
        </div>

        {/* Submit + WhatsApp + Clear */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Complete Order */}
          <button
            type="submit"
            disabled={pending}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md bg-[--brand-600] text-white px-4 py-2 text-sm font-medium disabled:opacity-60"
          >
            {pending && (
              <span className="h-4 w-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
            )}
            {pending ? "Processing..." : "Complete order"}
          </button>

          {/* WhatsApp Checkout */}
          <a
            href={generateWhatsAppLink(
              generateWhatsAppMessage(cartItems, cartTotal, form.fullName)
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md bg-green-600 text-white px-4 py-2 text-sm font-medium active:scale-press transition"
          >
            Checkout via WhatsApp
          </a>

          {/* Clear Form */}
          <button
            type="button"
            onClick={clearForm}
            className="w-full sm:w-auto text-xs text-text-muted underline underline-offset-4"
          >
            Clear form
          </button>
        </div>
      </form>
    </div>
  );
}