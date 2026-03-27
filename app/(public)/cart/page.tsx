"use client";

import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import CheckoutProgress from "@/components/checkout/CheckoutProgress";
import { useCart } from "@/components/cart/CartProvider";
import CartItemRow from "@/components/cart/CartItemRow";
import { formatPrice } from "@/lib/formatters/";

export default function CartPage() {
  const { items, total, itemCount, isEmpty, isHydrated, clearCart } = useCart();

  if (!isHydrated) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  return (
    <div className="space-y-10 py-10">
      <CheckoutProgress step={1} />

      <header className="space-y-2">
        <h1 className="heading-1 text-[var(--color-text-primary)]">Your Cart</h1>
        <p className="text-[var(--color-text-secondary)] text-sm">
          {isEmpty
            ? "You have no items in your cart yet."
            : `You have ${itemCount} item${itemCount === 1 ? "" : "s"} in your cart.`}
        </p>
      </header>

      {isEmpty ? (
        <Card className="p-8 text-center space-y-4">
          <p className="text-[var(--color-text-secondary)]">
            Your cart is currently empty. Browse our collection to find something you love.
          </p>
          <Button asChild>
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          {/* Items */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="heading-3 text-[var(--color-text-primary)]">
                Items
              </h2>
              <button
                onClick={clearCart}
                className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-danger-500)] transition-colors"
              >
                Clear cart
              </button>
            </div>

            <div className="space-y-4">
              {items.map((item) => (
                <CartItemRow key={item.key} item={item} variant="default" />
              ))}
            </div>
          </Card>

          {/* Summary */}
          <Card className="p-6 space-y-4">
            <h2 className="heading-3 text-[var(--color-text-primary)]">
              Order Summary
            </h2>

            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-text-secondary)]">
                Subtotal
              </span>
              <span className="text-[var(--color-text-primary)] font-medium">
                {formatPrice(total)}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-text-secondary)]">
                Shipping
              </span>
              <span className="text-[var(--color-text-primary)] font-medium">
                Calculated at checkout
              </span>
            </div>

            <div className="flex justify-between pt-3 border-t border-[var(--color-border)]/40">
              <span className="label text-[var(--color-text-primary)]">
                Total
              </span>
              <span className="text-xl font-semibold text-[var(--color-text-primary)]">
                {formatPrice(total)}
              </span>
            </div>

            <Button asChild className="w-full mt-2">
              <Link href="/checkout/shipping">Proceed to Checkout</Link>
            </Button>

            <Button asChild variant="ghost" className="w-full">
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}
