"use client";

import { useState } from "react";

export default function AddToCartButton({ productId, variant, disabled }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (disabled || loading) return;

    if (!variant) {
      console.warn("Variant required for this product");
      return;
    }

    setLoading(true);

    const item = {
      productId,
      variantId: variant.id,
      quantity: 1,
      price: variant.price,
      attributes: variant.attributes,
    };

    console.log("Add to cart:", item);
    // cartStore.add(item)

    setLoading(false);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || loading}
      className="w-full rounded-md bg-primary py-3 font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? "Adding..." : "Add to Cart"}
    </button>
  );
}