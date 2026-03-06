"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/formatters";
import { useToast } from "@/components/ui/toast";

export default function StickyAddToCart({ product }: { product: Product }) {
  const toast = useToast();
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);

  const outOfStock = product.stock === 0;
  const price = formatPrice(product.priceNaira); // ✅ Correct field

  const increase = () => setQty((q) => Math.min(q + 1, product.stock));
  const decrease = () => setQty((q) => Math.max(q - 1, 1));

  const handleAdd = async () => {
    try {
      setLoading(true);

      // TODO: Replace with real API call
      await new Promise((res) => setTimeout(res, 800));

      toast.show("Added to cart!", "success");
    } catch {
      toast.show("Failed to add to cart", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-bg border-t border-neutral/20 shadow-card p-4 z-50">
      <div className="flex items-center justify-between gap-5">

        {/* Price */}
        <div className="flex flex-col">
          <span className="label text-neutral">Total</span>
          <span className="text-lg font-semibold text-primary tracking-tight">
            {price}
          </span>
        </div>

        {/* Quantity Stepper */}
        {!outOfStock && (
          <div className="flex items-center border border-neutral/40 rounded-lg overflow-hidden bg-bg">
            <button
              onClick={decrease}
              className="px-3 py-2 text-primary hover:bg-neutral/10 transition"
            >
              –
            </button>

            <input
              type="number"
              min={1}
              max={product.stock}
              value={qty}
              onChange={(e) =>
                setQty(
                  Math.min(product.stock, Math.max(1, Number(e.target.value)))
                )
              }
              className="
                w-12 text-center py-2 text-sm
                border-l border-r border-neutral/20
                focus:outline-none
              "
            />

            <button
              onClick={increase}
              className="px-3 py-2 text-primary hover:bg-neutral/10 transition"
            >
              +
            </button>
          </div>
        )}

        {/* Add Button */}
        <button
          disabled={outOfStock || loading}
          onClick={handleAdd}
          className="
            flex-1 bg-primary text-bg py-3 rounded-xl
            text-sm font-medium tracking-wide
            hover:opacity-90 transition disabled:opacity-50
          "
        >
          {loading ? "Adding..." : outOfStock ? "Out of stock" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}