"use client";

import { useState, useCallback } from "react";
import { useCart } from "./cart-context";

interface AddToCartButtonProps {
  id: string;
  name: string;
  price: number;
  image?: string;
  variants?: Record<string, string>;
  quantity?: number;
}

export default function AddToCartButton({
  id,
  name,
  price,
  image,
  variants = {},
  quantity = 1,
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [loading, setLoading] = useState(false);

  const uniqueKey = `${id}-${Object.entries(variants).map(([k, v]) => `${k}:${v}`).join("|") || "default"}`;

  const handleAdd = useCallback(() => {
    if (loading) return;
    setLoading(true);

    addItem({ id, name, price, image, variants, quantity, key: uniqueKey });

    setTimeout(() => setLoading(false), 200); // simulate UX feedback
  }, [addItem, id, name, price, image, variants, quantity, uniqueKey, loading]);

  return (
    <button
      onClick={handleAdd}
      disabled={loading}
      aria-label={`Add ${name} to cart`}
      className={`btn btn-primary w-full flex items-center justify-center transition-transform duration-150 hover:scale-105 active:scale-95 ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
    >
      {loading ? "Adding..." : "Add to Cart"}
    </button>
  );
}