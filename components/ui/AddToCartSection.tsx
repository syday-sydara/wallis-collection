"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";

export default function AddToCartSection({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const outOfStock = product.stock === 0;

  const handleAddToCart = async () => {
    try {
      setLoading(true);
      setError(null);

      // TODO: Replace with real API call
      await new Promise((res) => setTimeout(res, 1000));

      // TODO: Trigger toast notification
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to add to cart"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Stock Status */}
      <div className="text-sm font-medium">
        {outOfStock ? (
          <span className="text-status-danger">Out of stock</span>
        ) : (
          <span className="text-status-success">
            In stock ({product.stock} available)
          </span>
        )}
      </div>

      {/* Quantity Selector */}
      {!outOfStock && (
        <div className="flex items-center gap-4">
          <label htmlFor="qty" className="text-sm">
            Quantity
          </label>

          <input
            id="qty"
            type="number"
            min={1}
            max={product.stock}
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
            className="w-20 border border-neutral/40 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
          />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="text-sm text-status-danger bg-status-danger/10 rounded-lg p-3">
          {error}
        </div>
      )}

      {/* Add to Cart Button */}
      <button
        disabled={outOfStock || loading}
        onClick={handleAddToCart}
        className="w-full bg-primary text-bg py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50 font-medium"
      >
        {loading ? "Adding..." : "Add to Cart"}
      </button>
    </div>
  );
}
