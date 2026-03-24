"use client";

import Image from "next/image";
import { useCart } from "@/components/cart/CartProvider"; // ✅ CartProvider hook
import Button from "@/components/ui/Button";
import { X } from "lucide-react";
import Link from "next/link";

export default function CartPage() {
  const { items, increment, decrement, removeItem, clearCart, total, itemCount, isEmpty } = useCart();

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">
      <h1 className="heading-1 text-center">Your Cart</h1>

      {/* Continue shopping link if cart has items */}
      {!isEmpty && (
        <div className="text-center">
          <Link href="/products" className="text-[var(--color-primary-500)] underline text-sm hover:opacity-80">
            Continue Shopping
          </Link>
        </div>
      )}

      {/* Empty cart state */}
      {isEmpty && (
        <div className="text-center py-20 space-y-6">
          <p className="text-lg text-[var(--color-text-secondary)]">
            Your cart is empty.
          </p>
          <Button asChild variant="primary">
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
      )}

      {/* Cart items + summary */}
      {!isEmpty && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Items list */}
          <div className="lg:col-span-2 space-y-6">
            {items.map((item) => (
              <div key={item.key} className="flex items-center gap-4 p-4 border border-[var(--color-border)] rounded-lg">
                {item.image && (
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={80}
                    height={80}
                    className="w-20 h-20 object-cover rounded-md"
                  />
                )}

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{item.name}</h3>

                  {/* Variants */}
                  {item.variants && (
                    <p className="text-xs text-[var(--color-text-secondary)] truncate">
                      {Object.entries(item.variants)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(", ")}
                    </p>
                  )}

                  <p className="text-sm text-[var(--color-text-secondary)]">
                    ₦{item.price.toLocaleString()}
                  </p>

                  {/* Quantity controls */}
                  <div className="flex items-center mt-2 space-x-3">
                    <button
                      onClick={() => decrement(item.key)}
                      className="px-2 py-1 border border-[var(--color-border)] rounded hover:bg-[var(--color-bg-surface)] transition"
                      aria-label={`Decrease quantity of ${item.name}`}
                    >
                      −
                    </button>

                    <span className="font-medium">{item.quantity}</span>

                    <button
                      onClick={() => increment(item.key)}
                      className="px-2 py-1 border border-[var(--color-border)] rounded hover:bg-[var(--color-bg-surface)] transition"
                      aria-label={`Increase quantity of ${item.name}`}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Remove item */}
                <button
                  onClick={() => removeItem(item.key)}
                  className="text-[var(--color-danger-500)] hover:opacity-70"
                  aria-label={`Remove ${item.name} from cart`}
                >
                  <X size={20} />
                </button>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="p-6 border border-[var(--color-border)] rounded-lg h-fit space-y-6">
            <h2 className="heading-3">Order Summary</h2>

            <div className="flex justify-between text-sm">
              <span>Items ({itemCount})</span>
              <span>₦{total.toLocaleString()}</span>
            </div>

            <div className="flex justify-between text-lg font-semibold border-t pt-4">
              <span>Total</span>
              <span>₦{total.toLocaleString()}</span>
            </div>

            <Button asChild variant="primary" className="w-full">
              <Link href="/checkout/shipping">Proceed to Checkout</Link>
            </Button>

            <Button variant="subtle" className="w-full" onClick={clearCart}>
              Clear Cart
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}