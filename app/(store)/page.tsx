// app/(store)/checkout/page.tsx
"use client";

import { useState } from "react";
import type { CheckoutPayload } from "@/lib/checkout/schema";
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

export default function CheckoutPage() {
  const [form, setForm] = useState<CheckoutFormState>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const items = [
    {
      productId: "demo-product-id",
      quantity: 1
    }
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, items })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error ?? "Unable to process checkout");
        return;
      }

      if (data.data.paymentUrl) {
        window.location.href = data.data.paymentUrl;
      } else {
        window.location.href = `/checkout/success?orderId=${data.data.orderId}`;
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function update<K extends keyof CheckoutFormState>(key: K, value: CheckoutFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Checkout</h1>
        <p className="text-sm text-gray-600">
          Enter your details to complete your order.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* fullName, email, phone, address same as before */}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">City</label>
            <input
              className="w-full rounded-md border border-[--border-subtle] px-3 py-2 text-sm"
              value={form.city}
              onChange={(e) => update("city", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
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
          </div>
          <div className="space-y-2">
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

        {/* payment method, error, button same as before */}
      </form>
    </div>
  );
}
