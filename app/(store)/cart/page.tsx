"use client";

import { useCart } from "@/lib/cart/store";
import { formatCurrency } from "@/lib/utils";
import { Button, Card } from "@/components/ui";

export default function CartPage() {
  const { cart, removeItem, updateQuantity, clearCart } = useCart();

  if (cart.items.length === 0) {
    return <p className="text-center py-20 text-text-muted">Your cart is empty.</p>;
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 space-y-6">
      {cart.items.map((item) => (
        <Card key={item.variantId} padding="sm" className="flex items-center gap-4">
          {item.image && <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-md" />}
          <div className="flex-1 space-y-1">
            <p className="font-medium text-text">{item.name}</p>
            {item.variantName && <p className="text-sm text-text-muted">{item.variantName}</p>}
            <p className="text-sm">{formatCurrency(item.price)}</p>
            <div className="flex gap-2 items-center mt-1">
              <input
                type="number"
                value={item.quantity}
                min={1}
                className="input w-16 text-sm"
                onChange={(e) => updateQuantity(item.variantId, Number(e.target.value))}
              />
              <Button variant="outline" size="sm" onClick={() => removeItem(item.variantId)}>
                Remove
              </Button>
            </div>
          </div>
        </Card>
      ))}

      <div className="flex justify-between items-center mt-6">
        <p className="text-lg font-semibold">Total: {formatCurrency(cart.total)}</p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={clearCart}>Clear Cart</Button>
          <Button>Checkout</Button>
        </div>
      </div>
    </main>
  );
}