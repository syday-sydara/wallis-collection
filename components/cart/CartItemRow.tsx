"use client";

import Image from "next/image";
import { CartItem, useCart } from "@/components/cart/cart-context";

interface CartItemRowProps {
  item: CartItem;
}

export default function CartItemRow({ item }: CartItemRowProps) {
  const { increment, decrement, removeItem } = useCart();

  return (
    <div className="flex items-center space-x-4 py-4 border-b border-[var(--color-border)]">
      {/* Product Image */}
      <div className="flex-shrink-0 w-20 h-20 relative rounded-md overflow-hidden">
        <Image
          src={item.image || "/placeholder.png"}
          alt={item.name}
          fill
          className="object-cover"
          sizes="80px"
        />
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-sm truncate">{item.name}</h3>
        {item.variants && (
          <p className="text-xs text-[var(--color-text-secondary)] truncate">
            {Object.entries(item.variants)
              .map(([k, v]) => `${k}: ${v}`)
              .join(" • ")}
          </p>
        )}
        <p className="mt-1 text-sm font-semibold text-[var(--color-text-primary)]">
          ₦{item.price.toLocaleString()}
        </p>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => decrement(item.key)}
          className="px-2 py-1 border rounded-md text-sm hover:bg-[var(--color-accent-500)] hover:text-white transition"
          aria-label={`Decrease quantity of ${item.name}`}
        >
          −
        </button>
        <span className="text-sm w-6 text-center">{item.quantity}</span>
        <button
          onClick={() => increment(item.key)}
          className="px-2 py-1 border rounded-md text-sm hover:bg-[var(--color-accent-500)] hover:text-white transition"
          aria-label={`Increase quantity of ${item.name}`}
        >
          +
        </button>
      </div>

      {/* Remove Item */}
      <button
        onClick={() => removeItem(item.key)}
        className="ml-4 text-[var(--color-danger-500)] hover:text-red-700 transition text-sm"
        aria-label={`Remove ${item.name} from cart`}
      >
        Remove
      </button>
    </div>
  );
}