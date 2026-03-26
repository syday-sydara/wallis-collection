"use client";

import Image from "next/image";
import { X, Minus, Plus } from "lucide-react";
import { useCart } from "./CartProvider";
import clsx from "clsx";

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

  const isCompact = variant === "compact";

  return (
    <div
      className={clsx(
        "flex gap-4 pb-4 border-b border-[var(--color-border)]",
        isCompact ? "items-start" : "items-center"
      )}
      data-cart-item
      data-product-id={item.productId}
    >
      {/* Product Image */}
      <div className="relative w-20 h-20 rounded-md overflow-hidden bg-[var(--color-bg-surface)] flex-shrink-0">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            loading="lazy"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-[var(--color-border)]/30 animate-pulse" />
        )}
      </div>

      {/* Product Info */}
      <div className="flex flex-col flex-1">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-sm text-[var(--color-text-primary)] leading-tight">
            {item.name}
          </h3>

          {/* Remove Button */}
          <button
            onClick={() => removeItem(item.key)}
            aria-label="Remove item"
            className="text-[var(--color-text-muted)] hover:text-[var(--color-danger-500)] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Price */}
        <p className="text-sm font-semibold mt-1 text-[var(--color-text-primary)]">
          ₦{(item.price * item.quantity).toLocaleString()}
        </p>

        {/* Quantity Controls */}
        <div className="flex items-center gap-3 mt-3">
          <button
            onClick={() => decrement(item.key)}
            aria-label="Decrease quantity"
            className="
              p-1 rounded border border-[var(--color-border)]
              hover:bg-[var(--color-bg-surface)]
              transition
            "
          >
            <Minus size={14} />
          </button>

          <span className="text-sm font-medium w-6 text-center">
            {item.quantity}
          </span>

          <button
            onClick={() => increment(item.key)}
            aria-label="Increase quantity"
            disabled={item.quantity >= maxStock}
            className="
              p-1 rounded border border-[var(--color-border)]
              hover:bg-[var(--color-bg-surface)]
              disabled:opacity-40 transition
            "
          >
            <Plus size={14} />
          </button>
        </div>

        {/* Stock Warning */}
        {item.quantity >= maxStock && (
          <p
            className="text-xs text-[var(--color-danger-500)] mt-1"
            aria-live="polite"
          >
            Maximum stock reached
          </p>
        )}
      </div>
    </div>
  );
}
