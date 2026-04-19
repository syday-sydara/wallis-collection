"use client";

import { useCart } from "@/lib/cart/store";
import { formatCurrency } from "@/lib/utils";
import { Button, Card, Input } from "@/components/ui";
import EmptyState from "@/components/ui/EmptyState";
import type { CartItem } from "@/lib/cart/types";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function CartPage() {
  const router = useRouter();
  const { items, subtotal, removeItem, updateQuantity, increaseQty, decreaseQty, clear } = useCart();

  if (items.length === 0) {
    return (
      <div className="py-20 animate-fadeIn">
        <EmptyState
          title="Your cart is empty"
          description="Browse the store to add items to your cart."
          action={{
            label: "Continue Shopping",
            onClick: () => router.push("/"),
          }}
        />
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 space-y-6 animate-fadeIn pb-safe">
      {items.map((item: CartItem) => (
        <Card
          key={item.id}
          padding="sm"
          className="flex items-center gap-4 leading-none animate-fadeIn-fast"
        >
          {item.image && (
            <Image
              src={item.image}
              alt={item.name || "Product image"}
              width={80}
              height={80}
              className="rounded-md object-cover"
            />
          )}

          <div className="flex-1 space-y-1">
            <p className="font-medium text-text">{item.name}</p>

            {item.attributes && (
              <p className="text-sm text-text-muted">
                {Object.values(item.attributes).join(" / ")}
              </p>
            )}

            <p className="text-sm text-text-muted">
              {formatCurrency(item.unitPrice)} × {item.quantity}
            </p>

            <p className="text-sm font-semibold text-text">
              {formatCurrency(item.unitPrice * item.quantity)}
            </p>

            {/* Quantity Controls */}
            <div className="flex gap-2 items-center mt-2">
              <Button
                variant="outline"
                size="sm"
                className="min-h-touch active:scale-press"
                onClick={() => {
                  if (navigator.vibrate) navigator.vibrate(10);
                  decreaseQty(item.id);
                }}
              >
                –
              </Button>

              <Input
                type="number"
                value={item.quantity}
                min={1}
                className="w-16 text-center text-sm"
                onChange={(e) => {
                  const value = Math.max(1, Number(e.target.value) || 1);
                  updateQuantity(item.id, value);
                }}
              />

              <Button
                variant="outline"
                size="sm"
                className="min-h-touch active:scale-press"
                onClick={() => {
                  if (navigator.vibrate) navigator.vibrate(10);
                  increaseQty(item.id);
                }}
              >
                +
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="min-h-touch active:scale-press"
                onClick={() => removeItem(item.id)}
              >
                Remove
              </Button>
            </div>
          </div>
        </Card>
      ))}

      {/* Summary */}
      <div className="flex justify-between items-center mt-6 leading-none animate-fadeIn-fast">
        <p className="text-lg font-semibold">
          Total: {formatCurrency(subtotal)}
        </p>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="min-h-touch active:scale-press"
            onClick={clear}
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
