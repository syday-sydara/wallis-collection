"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";
import { useToast } from "@/components/ui/toast";
import { useCart } from "@/components/cart/cart-context";

export default function AddToCartSection({ product }: { product: Product }) {
  const toast = useToast();
  const { add } = useCart();

  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const outOfStock = product.stock === 0;

  const clampQty = (value: number) => {
    return Math.max(1, Math.min(product.stock, value));
  };

  const handleAddToCart = async () => {
    try {
      setLoading(true);
      setError(null);

      if (qty < 1 || qty > product.stock) {
        setError("Invalid quantity selected");
        return;
      }

      // Build CartItem shape expected by CartContext
      const cartItem = {
        id: product.id,
        name: product.name,
        slug: product.slug,
        priceCents: product.priceCents,
        quantity: qty,
        image: product.images?.[0] ?? null,
      };

      // Optimistic update
      add(cartItem);

      toast.show("Added to cart!", "success");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to add to cart";
      setError(message);
      toast.show(message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stock Status */}
      <div className="label">
        {outOfStock ? (
          <span className="text-danger">Out of stock</span>
        ) : (
          <span className="text-success">
            In stock ({product.stock} available)
          </span>
        )}
      </div>

      {/* Quantity Selector */}
      {!outOfStock && (
        <div className="flex items-center gap-4">
          <label htmlFor="qty" className="label text-primary">
            Quantity
          </label>

          <input
            id="qty"
            type="number"
            min={1}
            max={product.stock}
            value={qty}
            onChange={(e) => setQty(clampQty(Number(e.target.value)))}
            onBlur={() => setQty((v) => clampQty(v))}
            className="
              w-20 px-3 py-2 rounded-md border border-neutral/40
              text-sm tracking-wide
              focus:outline-none focus:ring-2 focus:ring-primary/40
              transition-all
            "
          />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="text-sm text-danger bg-danger/10 rounded-lg p-3 leading-relaxed">
          {error}
        </div>
      )}

      {/* Add to Cart Button */}
      <button
        disabled={outOfStock || loading}
        onClick={handleAddToCart}
        className="
          w-full bg-primary text-bg py-3 rounded-xl
          font-medium tracking-wide
          hover:opacity-90 transition-opacity
          disabled:opacity-50
        "
      >
        {loading ? "Adding..." : "Add to Cart"}
      </button>
    </div>
  );
}