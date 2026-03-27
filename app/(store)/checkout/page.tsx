"use client";

import { useState } from "react";

type CheckoutFormState = {
  email: string;
  phone: string;
  fullName: string;
  paymentMethod: "PAYSTACK" | "MONNIFY";
  shippingType: "STANDARD" | "EXPRESS";
  address: string;
  city: string;
  state: string;
};

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

  // TODO: replace with real cart items from state/store
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
        // fallback: redirect to success page with orderId
        window.location.href = `/checkout/success?orderId=${data.data.orderId}`;
      }
    } catch (err) {
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
        <div className="space-y-2">
          <label className="text-sm font-medium">Full name</label>
          <input
            className="w-full rounded-md border border-[--border-subtle] px-3 py-2 text-sm"
            value={form.fullName}
            onChange={(e) => update("fullName", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <input
            type="email"
            className="w-full rounded-md border border-[--border-subtle] px-3 py-2 text-sm"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Phone</label>
          <input
            className="w-full rounded-md border border-[--border-subtle] px-3 py-2 text-sm"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Address</label>
          <textarea
            className="w-full rounded-md border border-[--border-subtle] px-3 py-2 text-sm"
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
            required
          />
        </div>

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
            <input
              className="w-full rounded-md border border-[--border-subtle] px-3 py-2 text-sm"
              value={form.state}
              onChange={(e) => update("state", e.target.value)}
              required
            />
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

        <div className="space-y-2">
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

        {error && (
          <p className="text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-[--brand-600] text-white py-2 text-sm font-medium disabled:opacity-60"
        >
          {loading ? "Processing..." : "Complete order"}
        </button>
      </form>
    </div>
  );
}
