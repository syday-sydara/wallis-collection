"use client";

import Image from "next/image";
import { X, Minus, Plus } from "lucide-react";
import { useCart } from "./CartProvider";
import Button from "@/components/ui/Button";

interface CartItemRowProps {
  item: {
    key: string;
    productId: string;
    name: string;
    price: number;
    quantity: number;
    stock?: number;
    image?: string;
  };
  variant?: "default" | "compact";
  maxStock?: number;
}

export default function CartItemRow({
  item,
  variant = "default",
  maxStock = item.stock ?? Infinity,
}: CartItemRowProps) {
  const { increment, decrement, removeItem } = useCart();

  const handleIncrement = () => increment(item.key);
  const handleDecrement = () => decrement(item.key);
  const handleRemove = () => removeItem(item.key);

  const isCompact = variant === "compact";

  return (
    <div
      className={`flex gap-4 border-b border-border pb-4 ${
        isCompact ? "items-start" : "items-center"
      }`}
    >
      {/* Product Image */}
      <div className="relative w-20 h-20 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 animate-pulse" />
        )}
      </div>

      {/* Product Info */}
      <div className="flex flex-col flex-1">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-sm text-text-primary leading-tight">
            {item.name}
          </h3>

          {/* Remove Button */}
          <button
            onClick={handleRemove}
            aria-label="Remove item"
            className="text-text-muted hover:text-danger-500 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Price */}
        <p className="text-sm font-semibold mt-1">
          ₦{(item.price * item.quantity).toLocaleString()}
        </p>

        {/* Quantity Controls */}
        <div className="flex items-center gap-3 mt-3">
          <button
            onClick={handleDecrement}
            aria-label="Decrease quantity"
            className="p-1 rounded border border-border hover:bg-gray-100 transition"
          >
            <Minus size={14} />
          </button>

          <span className="text-sm font-medium w-6 text-center">
            {item.quantity}
          </span>

          <button
            onClick={handleIncrement}
            aria-label="Increase quantity"
            disabled={item.quantity >= maxStock}
            className="p-1 rounded border border-border hover:bg-gray-100 disabled:opacity-40 transition"
          >
            <Plus size={14} />
          </button>
        </div>

        {/* Stock Warning */}
        {item.quantity >= maxStock && (
          <p className="text-xs text-danger-500 mt-1">
            Maximum stock reached
          </p>
        )}
      </div>
    </div>
  );
}