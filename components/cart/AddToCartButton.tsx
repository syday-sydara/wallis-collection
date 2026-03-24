"use client";

import { useState } from "react";
import { useCart } from "./CartProvider";

interface AddToCartButtonProps {
  id: string;
  name: string;
  price: number;           // in Naira
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

  const variantKey = Object.entries(variants)
    .map(([k, v]) => `${k}:${v}`)
    .join("|") || "default";

  const uniqueKey = `${id}-${variantKey}`;

  const handleAdd = () => {
    setLoading(true);
    addItem({ id, name, price, image, variants, quantity, key: uniqueKey });
    setTimeout(() => setLoading(false), 200);
  };

  return (
    <button
      onClick={handleAdd}
      disabled={loading}
      className="btn btn-primary w-full flex items-center justify-center"
    >
      {loading ? "Adding..." : "Add to Cart"}
    </button>
  );
}