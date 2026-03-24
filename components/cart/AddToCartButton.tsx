"use client";

import { useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { toCartItem } from "@/lib/cart/cart";

interface AddToCartButtonProps {
  product: {
    id: string;
    name: string;
    price: number;
    salePrice: number | null;
    stock: number;
    images?: { url: string; position: number }[];
  };
  variants?: Record<string, string>;
  quantity?: number;
}

export default function AddToCartButton({
  product,
  variants = {},
  quantity = 1,
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [loading, setLoading] = useState(false);

  const handleAdd = () => {
    if (loading || product.stock < 1) return;

    setLoading(true);

    const item = toCartItem(product, quantity, variants);
    addItem(item);

    // Reset loading after short delay
    setTimeout(() => setLoading(false), 300);
  };

  // Show price label based on stock
  const label = product.stock < 1
    ? "Out of Stock"
    : loading
    ? "Adding..."
    : "Add to Cart";

  return (
    <button
      onClick={handleAdd}
      disabled={loading || product.stock < 1}
      className="btn btn-primary w-full flex items-center justify-center disabled:opacity-50"
    >
      {label}
    </button>
  );
}