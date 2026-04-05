"use client";

import { useCart } from "@/lib/cart/store";
import { formatCurrency } from "@/lib/utils";
import { Button, Card, Input } from "@/components/ui/";
import EmptyState from "@/components/products/EmptyState";
import type { CartItem } from "@/lib/cart/types";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const router = useRouter();
  const { cart, removeItem, updateQuantity, clearCart } = useCart();

  if (cart.items.length === 0) {
    return (
      <div className="py-20 animate-fadeIn">
        <EmptyState
          title="Your cart is empty"
          description="Browse the store to add items to your cart."
        />
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 space-y-6 animate-fadeIn pb-safe">
      {cart.items.map((item: CartItem) => (
        <Card
          key={item.variantId}
          padding="sm"
          className="flex items-center gap-4 leading-none"
        >
          {item.image && (
            <img
              src={item.image}
              alt={item.name || "Product image"}
              className="w-20 h-20 object-cover rounded-md"
            />
          )}

          <div className="flex-1 space-y-1">
            <p className="font-medium text-text leading-none">{item.name}</p>

            {item.variantName && (
              <p className="text-sm text-text-muted leading-none">
                {item.variantName}
              </p>
            )}

            <p className="text-sm leading-none">
              {formatCurrency(item.price)}
            </p>

            <div className="flex gap-2 items-center mt-2">
              <Input
                type="number"
                value={item.quantity}
                min={1}
                className="w-20 text-sm"
                onChange={(e) => {
                  const value = Math.max(1, Number(e.target.value) || 1);
                  updateQuantity(item.variantId, value);
                }}
              />

              <Button
                variant="outline"
                size="sm"
                className="min-h-touch active:scale-press"
                onClick={() => removeItem(item.variantId)}
              >
                Remove
              </Button>
            </div>
          </div>
        </Card>
      ))}

      <div className="flex justify-between items-center mt-6 leading-none">
        <p className="text-lg font-semibold">
          Total: {formatCurrency(cart.total)}
        </p>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="min-h-touch active:scale-press"
            onClick={clearCart}
          >
            Clear Cart
          </Button>

          <Button
            className="min-h-touch active:scale-press"
            onClick={() => router.push("/checkout")}
          >
            Checkout
          </Button>
        </div>
      </div>
    </main>
  );
}