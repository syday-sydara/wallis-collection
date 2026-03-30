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
  onQuantityChange?: (id: string, qty: number) => void;
  onRemove?: (id: string) => void;
}

export default function CartSummary({ items, onQuantityChange, onRemove }: Props) {
  const total = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  return (
    <div className="bg-surface-muted p-4 rounded-md shadow-sm space-y-4">
      <h2 className="text-lg font-semibold">Your Cart</h2>

      {items.length === 0 && (
        <p className="text-sm text-text-muted">Your cart is empty.</p>
      )}

      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.id} className="flex gap-3 items-center">
            {item.image && (
              <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-md flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{item.name}</p>
              {item.variant && <p className="text-xs text-text-muted truncate">{item.variant}</p>}
              <p className="text-sm text-text mt-1">{formatCurrency(item.unitPrice)}</p>
            </div>
            {onQuantityChange && (
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => onQuantityChange(item.id, Math.max(1, item.quantity - 1))} className="px-2 py-1 border rounded-md text-sm disabled:opacity-50" disabled={item.quantity <= 1}>−</button>
                <span className="w-6 text-center text-sm">{item.quantity}</span>
                <button type="button" onClick={() => onQuantityChange(item.id, item.quantity + 1)} className="px-2 py-1 border rounded-md text-sm">+</button>
              </div>
            )}
            {onRemove && (
              <button type="button" onClick={() => onRemove(item.id)} className="ml-2 text-red-600 text-sm hover:underline">Remove</button>
            )}
          </li>
        ))}
      </ul>

      <div className="border-t border-border-subtle pt-3 flex justify-between text-sm font-medium">
        <span>Total:</span>
        <span>{formatCurrency(total)}</span>
      </div>
    </div>
  );
}