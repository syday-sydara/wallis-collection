"use client";

import { formatCurrency } from "@/lib/utils/formatters/currency";
import type { CartItem } from "@/lib/cart/store";
import Image from "next/image";

interface Props {
  items: CartItem[];
  shippingCost?: number;
  onQuantityChange?: (id: string, qty: number) => void;
  onRemove?: (id: string) => void;
}

export default function CartSummary({
  items,
  shippingCost = 0,
  onQuantityChange,
  onRemove,
}: Props) {
  const subtotal = items.reduce(
    (sum, i) => sum + i.unitPrice * i.quantity,
    0
  );
  const total = subtotal + shippingCost;

  return (
    <div className="bg-bg-muted p-4 rounded-md shadow-sm space-y-4 animate-fadeIn pb-safe max-h-[70vh] overflow-y-auto">
      <h2 className="text-lg font-semibold text-text-primary leading-none">
        Your Cart
      </h2>

      {items.length === 0 && (
        <p className="text-sm text-text-secondary">Your cart is empty.</p>
      )}

      <ul className="space-y-3" role="list">
        {items.map((item) => (
          <li
            key={item.id}
            role="listitem"
            className="flex flex-wrap gap-3 items-center"
          >
            <Image
              src={item.image ?? "/placeholder.png"}
              alt={item.name ?? "Product image"}
              width={64}
              height={64}
              className="rounded-md object-cover flex-shrink-0"
            />

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">
                {item.name}
              </p>

              {item.attributes && (
                <p className="text-xs text-text-secondary truncate">
                  {Object.values(item.attributes).join(" / ")}
                </p>
              )}

              <p className="text-sm text-text-primary mt-1">
                {formatCurrency(item.unitPrice)} × {item.quantity} ={" "}
                {formatCurrency(item.unitPrice * item.quantity)}
              </p>
            </div>

            {/* Quantity Controls */}
            {onQuantityChange && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label={`Decrease quantity of ${item.name}`}
                  onClick={() =>
                    onQuantityChange(item.id, Math.max(1, item.quantity - 1))
                  }
                  disabled={item.quantity <= 1}
                  className="px-2 py-1 border border-border rounded-md text-sm bg-bg-default disabled:opacity-50 active:scale-95 transition"
                >
                  −
                </button>

                <span className="w-6 text-center text-sm">
                  {item.quantity}
                </span>

                <button
                  type="button"
                  aria-label={`Increase quantity of ${item.name}`}
                  onClick={() =>
                    onQuantityChange(item.id, item.quantity + 1)
                  }
                  className="px-2 py-1 border border-border rounded-md text-sm bg-bg-default active:scale-95 transition"
                >
                  +
                </button>
              </div>
            )}

            {/* Remove */}
            {onRemove && (
              <button
                type="button"
                aria-label={`Remove ${item.name} from cart`}
                onClick={() => onRemove(item.id)}
                className="ml-2 text-danger hover:underline text-sm active:scale-95 transition"
              >
                Remove
              </button>
            )}
          </li>
        ))}
      </ul>

      {items.length > 0 && (
        <>
          <div className="border-t border-border pt-3 flex justify-between text-sm font-medium">
            <span>Subtotal:</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>

          {shippingCost > 0 && (
            <div className="flex justify-between text-sm font-medium mt-1">
              <span>Shipping:</span>
              <span>{formatCurrency(shippingCost)}</span>
            </div>
          )}

          <div className="flex justify-between text-sm font-bold mt-1">
            <span>Total:</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </>
      )}
    </div>
  );
}
