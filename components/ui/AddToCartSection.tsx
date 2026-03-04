"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";

export default function AddToCartSection({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const outOfStock = product.stock === 0;

  return (
    <div className="space-y-4">
      {/* Stock */}
      <div className="text-sm">
        {outOfStock ? (
          <span className="text-status-danger">
            Out of stock
          </span>
        ) : (
          <span className="text-status-success">
            In stock ({product.stock} available)
          </span>
        )}
      </div>

      {/* Quantity */}
      {!outOfStock && (
        <div className="flex items-center gap-4">
          <label className="text-sm">Quantity</label>

          <input
            type="number"
            min={1}
            max={product.stock}
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
            className="w-20 border border-neutral rounded-md px-2 py-1"
          />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="text-sm text-status-danger bg-status-danger/10 rounded-lg p-3">
          {error}
        </div>
      )}

      {/* Button */}
      <button
        disabled={outOfStock || loading}
        onClick={async () => {
          try {
            setLoading(true);
            setError(null);
            // TODO: Implement actual add to cart API call
            // const response = await fetch('/api/cart/add', { ... })
            setTimeout(() => {
              setLoading(false);
              // TODO: Show success notification
            }, 1000);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to add to cart");
            setLoading(false);
          }
        }}
        className="w-full bg-primary text-background py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50 font-medium"
      >
        {loading ? "Adding..." : "Add to Cart"}
      </button>
    </div>
  );
}