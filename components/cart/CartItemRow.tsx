"use client";

import { X } from "lucide-react";
import { useCart } from "./CartProvider";
import Image from "next/image";

export default function CartItemRow({ item, variant = "default", maxStock }) {
  const { increment, decrement, removeItem } = useCart();

  const compact = variant === "compact";

  return (
    <div
      className={`flex items-center gap-4 ${
        compact ? "py-2" : "py-4"
      } border-b last:border-none`}
    >
      {/* Product Image */}
      {item.image && (
        <Image
          src={item.image}
          alt={item.name}
          width={compact ? 48 : 64}
          height={compact ? 48 : 64}
          className="rounded-md object-cover"
        />
      )}

      {/* Product Info */}
      <div className="flex-1">
        <h3 className="font-medium text-sm">{item.name}</h3>
        <p className="text-xs text-gray-500">₦{item.price.toLocaleString()}</p>

        {/* Quantity Controls */}
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => decrement(item.key)}
            className="px-2 py-1 border rounded text-sm"
          >
            -
          </button>

          <span className="w-6 text-center text-sm">{item.quantity}</span>

          <button
            onClick={() => increment(item.key)}
            disabled={item.quantity >= (maxStock ?? item.stock ?? Infinity)}
            className="px-2 py-1 border rounded text-sm disabled:opacity-50"
          >
            +
          </button>
        </div>
      </div>

      {/* Remove Button */}
      <button
        onClick={() => removeItem(item.key)}
        className="text-gray-400 hover:text-red-500"
      >
        <X size={16} />
      </button>
    </div>
  );
}