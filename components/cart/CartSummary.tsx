"use client";

import { formatCurrency } from "@/lib/utils/index";

interface CartItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  image?: string;
  variant?: string;
}

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
  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const total = subtotal + shippingCost;

  return (
    <div className="bg-surface-muted p-4 rounded-lg shadow-sm space-y-4 animate-fadeIn-fast pb-safe">
      <h2 className="text-lg font-semibold text-text leading-none">Your Cart</h2>

      {items.length === 0 && (
        <p className="text-sm text-text-muted">Your cart is empty.</p>
      )}

      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.id} className="flex gap-3 items-center leading-none">
            {item.image && (
              <img
                src={item.image}
                alt={item.name}
                className="w-16 h-16 object-cover rounded-md flex-shrink-0"
              />
            )}

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text truncate leading-none">
                {item.name}
              </p>

              {item.variant && (
                <p className="text-xs text-text-muted truncate leading-none">
                  {item.variant}
                </p>
              )}

              <p className="text-sm text-text mt-1 leading-none">
                {formatCurrency(item.unitPrice)}
              </p>
            </div>

            {onQuantityChange && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label={`Decrease quantity of ${item.name}`}
                  onClick={() =>
                    onQuantityChange(item.id, Math.max(1, item.quantity - 1))
                  }
                  className="px-2 py-1 border rounded-md text-sm disabled:opacity-50 min-h-touch active:scale-press transition"
                  disabled={item.quantity <= 1}
                >
                  −
                </button>

                <span className="w-6 text-center text-sm leading-none">
                  {item.quantity}
                </span>

                <button
                  type="button"
                  aria-label={`Increase quantity of ${item.name}`}
                  onClick={() => onQuantityChange(item.id, item.quantity + 1)}
                  className="px-2 py-1 border rounded-md text-sm min-h-touch active:scale-press transition"
                >
                  +
                </button>
              </div>
            )}

            {onRemove && (
              <button
                type="button"
                aria-label={`Remove ${item.name} from cart`}
                onClick={() => onRemove(item.id)}
                className="ml-2 text-danger text-sm hover:underline active:scale-press transition"
              >
                Remove
              </button>
            )}
          </li>
        ))}
      </ul>

      {items.length > 0 && (
        <>
          <div className="border-t border-border-subtle pt-3 flex justify-between text-sm font-medium leading-none">
            <span>Subtotal:</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>

          {shippingCost > 0 && (
            <div className="flex justify-between text-sm font-medium mt-1 leading-none">
              <span>Shipping:</span>
              <span>{formatCurrency(shippingCost)}</span>
            </div>
          )}

          <div className="flex justify-between text-sm font-bold mt-1 leading-none">
            <span>Total:</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </>
      )}
    </div>
  );
}
