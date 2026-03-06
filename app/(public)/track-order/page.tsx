"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/formatters";

export default function Page() {
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLookup = async () => {
    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const res = await fetch("/api/orders/lookup", {
        method: "POST",
        body: JSON.stringify({ orderId }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setOrder(data);
      }
    } catch {
      setError("Unable to fetch order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-20 space-y-16">

      {/* Page Title */}
      <h1 className="heading-1 text-primary tracking-tight">
        Track Your Order
      </h1>

      {/* Lookup Form */}
      <div className="max-w-md space-y-6">
        <label className="label text-primary">Enter your Order ID</label>

        <input
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          placeholder="e.g. ord_12345"
          className="input"
        />

        <button
          onClick={handleLookup}
          disabled={!orderId || loading}
          className="w-full bg-primary text-bg py-3 rounded-xl text-sm font-medium tracking-wide hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? "Searching..." : "Track Order"}
        </button>

        {error && (
          <p className="text-danger text-sm bg-danger/10 p-3 rounded-lg">
            {error}
          </p>
        )}
      </div>

      {/* Order Details */}
      {order && (
        <div className="space-y-12">

          {/* Status */}
          <div className="border border-neutral/20 rounded-xl p-6 shadow-soft space-y-4 max-w-xl">
            <h2 className="heading-3 text-primary">Order Status</h2>

            <div className="flex justify-between text-sm">
              <span className="text-neutral">Order ID</span>
              <span className="text-primary font-medium">{order.id}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-neutral">Status</span>
              <span className="text-secondary font-semibold">
                {order.status}
              </span>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-6 max-w-xl">
            <h2 className="heading-3 text-primary">Items</h2>

            <div className="space-y-6">
              {order.items.map((item: any) => (
                <div
                  key={item.id}
                  className="flex justify-between border-b border-neutral/20 pb-4"
                >
                  <span className="text-primary">{item.productId}</span>
                  <span className="text-secondary font-medium">
                    {item.quantity} × {formatPrice(item.priceNaira)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="border border-neutral/20 rounded-xl p-6 shadow-soft space-y-4 max-w-xl">
            <h2 className="heading-3 text-primary">Order Summary</h2>

            <div className="flex justify-between text-sm">
              <span className="text-neutral">Total</span>
              <span className="text-primary font-semibold text-lg">
                {formatPrice(order.totalNaira)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}