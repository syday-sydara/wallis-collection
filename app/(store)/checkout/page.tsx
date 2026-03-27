"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import type { CheckoutPayload } from "@/lib/checkout/schema";
import { CheckoutPayloadSchema } from "@/lib/checkout/schema";
import { NIGERIAN_STATES } from "@/lib/checkout/constants";

type CheckoutFormState = Omit<CheckoutPayload, "items">;

const initialForm: CheckoutFormState = {
  email: "",
  phone: "",
  fullName: "",
  paymentMethod: "PAYSTACK",
  shippingType: "STANDARD",
  address: "",
  city: "",
  state: ""
};

const CheckoutClientSchema = CheckoutPayloadSchema.omit({ items: true });

type FieldErrors = Partial<Record<keyof CheckoutFormState, string>>;

const STORAGE_KEY = "wallis_checkout_form";

export default function CheckoutPage() {
  const [form, setForm] = useState<CheckoutFormState>(initialForm);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [shippingCost, setShippingCost] = useState<number | null>(null);
  const [eta, setEta] = useState<string | null>(null);

  const items = [
    {
      productId: "demo-product-id",
      quantity: 1
    }
  ];

  // Load from localStorage
  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setForm((prev) => ({ ...prev, ...parsed }));
      } catch {
        // ignore
      }
    }
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
  }, [form]);

  // Simple shipping cost + ETA (client-side preview)
  useEffect(() => {
    if (!form.state) {
      setShippingCost(null);
      setEta(null);
      return;
    }

    const base = form.state === "Lagos" || form.state === "FCT" ? 1500 : 2500;
    const extra = form.shippingType === "EXPRESS" ? 1000 : 0;
    const total = base + extra;

    setShippingCost(total);

    const days = form.shippingType === "EXPRESS" ? 1 : 3;
    setEta(`${days}-${days + 2} business days`);
  }, [form.state, form.shippingType]);

  function update<K extends keyof CheckoutFormState>(key: K, value: CheckoutFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setApiError(null);

    // client-side validation
    const parsed = CheckoutClientSchema.safeParse(form);
    if (!parsed.success) {
      const errors: FieldErrors = {};
      const flat = parsed.error.flatten().fieldErrors;
      (Object.keys(flat) as (keyof CheckoutFormState)[]).forEach((key) => {
        const msg = flat[key]?.[0];
        if (msg) errors[key] = msg;
      });
      setFieldErrors(errors);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, items })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setApiError(data.error ?? "Unable to process checkout");
        return;
      }

      // TODO: replace with toast system
      // showToast("Order created successfully", "success");

      if (data.data.paymentUrl) {
        window.location.href = data.data.paymentUrl;
      } else {
        window.location.href = `/checkout/success?orderId=${data.data.orderId}`;
      }
    } catch {
      setApiError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Checkout</h1>
        <p className="text-sm text-gray-600">
          Enter your details to complete your order.
        </p>
      </header>

      {apiError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field
          label="Full name"
          value={form.fullName}
          onChange={(v) => update("fullName", v)}
          error={fieldErrors.fullName}
          required
        />

        <Field
          label="Email"
          type="email"
          value={form.email}
          onChange={(v) => update("email", v)}
          error={fieldErrors.email}
          required
        />

        <Field
          label="Phone"
          value={form.phone}
          onChange={(v) => update("phone", v)}
          error={fieldErrors.phone}
          helper="Use a valid Nigerian number (e.g. 080..., 070..., +234...)"
          required
        />

        <Field
          label="Address"
          as="textarea"
          value={form.address}
          onChange={(v) => update("address", v)}
          error={fieldErrors.address}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field
            label="City"
            value={form.city}
            onChange={(v) => update("city", v)}
            error={fieldErrors.city}
            required
          />

          <div className="space-y-1">
            <label className="text-sm font-medium">State</label>
            <select
              className="w-full rounded-md border border-[--border-subtle] px-3 py-2 text-sm"
              value={form.state}
              onChange={(e) => update("state", e.target.value)}
              required
            >
              <option value="">Select state</option>
              {NIGERIAN_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
            {fieldErrors.state && (
              <p className="text-xs text-red-600">{fieldErrors.state}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Shipping</label>
            <select
              className="w-full rounded-md border border-[--border-subtle] px-3 py-2 text-sm"
              value={form.shippingType}
              onChange={(e) =>
                update("shippingType", e.target.value as CheckoutFormState["shippingType"])
              }
            >
              <option value="STANDARD">Standard</option>
              <option value="EXPRESS">Express</option>
            </select>
          </div>
        </div>

        {shippingCost !== null && (
          <div className="text-sm text-gray-700 space-y-1">
            <p>
              Shipping cost: <span className="font-medium">₦{shippingCost.toLocaleString()}</span>
            </p>
            {eta && <p className="text-xs text-gray-500">Estimated delivery: {eta}</p>}
          </div>
        )}

        <div className="space-y-1">
          <label className="text-sm font-medium">Payment method</label>
          <select
            className="w-full rounded-md border border-[--border-subtle] px-3 py-2 text-sm"
            value={form.paymentMethod}
            onChange={(e) =>
              update("paymentMethod", e.target.value as CheckoutFormState["paymentMethod"])
            }
          >
            <option value="PAYSTACK">Paystack</option>
            <option value="MONNIFY">Monnify</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-[--brand-600] text-white py-2 text-sm font-medium disabled:opacity-60"
        >
          {loading && (
            <span className="h-4 w-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
          )}
          {loading ? "Processing..." : "Complete order"}
        </button>
      </form>
    </div>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  helper?: string;
  required?: boolean;
  type?: string;
  as?: "input" | "textarea";
};

function Field({
  label,
  value,
  onChange,
  error,
  helper,
  required,
  type = "text",
  as = "input"
}: FieldProps) {
  const InputTag = as === "textarea" ? "textarea" : "input";

  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <InputTag
        className="w-full rounded-md border border-[--border-subtle] px-3 py-2 text-sm"
        value={value}
        onChange={(e: any) => onChange(e.target.value)}
        required={required}
        {...(as === "input" ? { type } : {})}
      />
      {helper && !error && <p className="text-xs text-gray-500">{helper}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
