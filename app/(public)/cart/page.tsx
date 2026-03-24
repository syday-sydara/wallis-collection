"use client";

import Image from "next/image";
import { useCart } from "@/components/cart/CartProvider";
import Button from "@/components/ui/Button";
import { X } from "lucide-react";
import Link from "next/link";

export default function CartPage() {
  const {
    items,
    increment,
    decrement,
    removeItem,
    clearCart,
    total,
    itemCount,
    isEmpty,
  } = useCart();

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">
      <h1 className="heading-1 text-center">Your Cart</h1>

      {!isEmpty && (
        <div className="text-center">
          <Link
            href="/products"
            className="text-primary underline text-sm hover:opacity-80"
          >
            Continue Shopping
          </Link>
        </div>
      )}

      {isEmpty && (
        <div className="text-center py-20">
          <p className="text-lg text-[var(--color-text-secondary)] mb-6">
            Your cart is empty.
          </p>
          <Button asChild variant="primary">
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
      )}

      {!isEmpty && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {items.map((item) => (
              <div
                key={item.key}
                className="flex items-center gap-4 p-4 border border-[var(--color-border)] rounded-lg"
              >
                {item.image && (
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={80}
                    height={80}
                    className="w-20 h-20 object-cover rounded-md"
                  />
                )}

                <div className="flex-1">
                  <h3 className="font-semibold">{item.name}</h3>

                  {/* Variant display */}
                  {item.variants && Object.keys(item.variants).length > 0 && (
                    <p className="text-xs text-[var(--color-text-secondary)]">
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
                    >
                      -
                    </button>

                    <span className="font-medium">{item.quantity}</span>

                    <button
                      onClick={() => increment(item.key)}
                      className="px-2 py-1 border border-[var(--color-border)] rounded hover:bg-[var(--color-bg-surface)] transition"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Remove item */}
                <button
                  onClick={() => removeItem(item.key)}
                  className="text-[var(--color-danger-500)] hover:opacity-70"
                >
                  <X size={20} />
                </button>
              </div>
            ))}
          </div>

          {/* Order Summary */}
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