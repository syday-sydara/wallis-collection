"use client";

import { useState } from "react";

export default function AddToCartSection({ product }: any) {
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);

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

      {/* Button */}
      <button
        disabled={outOfStock || loading}
        onClick={() => {
          setLoading(true);
          setTimeout(() => setLoading(false), 1000);
        }}
        className="w-full bg-primary text-background py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50"
      >
        {loading ? "Adding..." : "Add to Cart"}
      </button>
    </div>
  );
}