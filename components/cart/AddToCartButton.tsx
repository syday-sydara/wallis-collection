"use client";

import { useState } from "react";
import { useCart } from "./cart-context";

interface AddToCartButtonProps {
  id: string;
  name: string;
  price: number;
  image?: string;
  variants?: Record<string, string>; // e.g. { size: "M", color: "Black" }
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

  // Create a unique key based on product + variant combination
  const variantKey =
    Object.entries(variants)
      .map(([k, v]) => `${k}:${v}`)
      .join("|") || "default";

  const uniqueKey = `${id}-${variantKey}`;

  const handleAdd = () => {
    setLoading(true);

    addItem({
      id,
      name,
      price,
      image,
      variants,
      quantity,
      key: uniqueKey,
    });

    setTimeout(() => setLoading(false), 300);
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