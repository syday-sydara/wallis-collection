"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useCart } from "@/lib/cart/store"; // ✅ shared cart store

type Variant = { id: string; price: number; attributes?: Record<string, any> };

type Props = { productId: string; variant?: Variant; disabled?: boolean };

export default function AddToCartButton({ productId, variant, disabled }: Props) {
  const [loading, setLoading] = useState(false);
  const { addItem } = useCart(); // ✅ add to cart action

  async function handleClick() {
    if (disabled || loading) return;
    if (!variant) return console.warn("Variant required");

    setLoading(true);

    addItem({
      id: productId,
      variantId: variant.id,
      name: "", // optional — depends on your cart structure
      image: "",
      quantity: 1,
      unitPrice: variant.price,
      attributes: variant.attributes,
    });

    // Simulate delay for UX
    setTimeout(() => setLoading(false), 400);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || loading}
      aria-busy={loading}
      className="
        w-full rounded-md bg-primary py-3 font-medium text-primary-foreground
        disabled:opacity-50 disabled:cursor-not-allowed
        hover:bg-primary-hover active:bg-primary-active active:scale-press
        transition-all animate-fadeIn-fast min-h-touch
      "
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Adding...
        </span>
      ) : (
        "Add to Cart"
      )}
    </button>
  );
}