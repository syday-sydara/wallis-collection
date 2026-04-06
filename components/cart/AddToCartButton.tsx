"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useCart } from "@/components/cart/useCart";

type Variant = { id: string; price: number; attributes?: Record<string, any> };

type Props = {
  productId: string;
  name: string;
  image: string;
  variant?: Variant;
  requiresVariant?: boolean;
  disabled?: boolean;
};

export default function AddToCartButton({
  productId,
  name,
  image,
  variant,
  requiresVariant = false,
  disabled,
}: Props) {
  const [loading, setLoading] = useState(false);
  const { addItem } = useCart();

  async function handleClick() {
    if (disabled || loading) return;

    if (requiresVariant && !variant) {
      console.warn("Variant required");
      return;
    }

    setLoading(true);

    addItem({
      id: productId,
      variantId: variant?.id ?? null,
      name,
      image,
      quantity: 1,
      unitPrice: variant?.price ?? 0,
      attributes: variant?.attributes,
    });

    setTimeout(() => setLoading(false), 400);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || loading}
      aria-busy={loading}
      aria-label={loading ? "Adding to cart" : "Add to cart"}
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