"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";
import Button from "@/components/ui/Button";
import CartItemRow from "@/components/cart/CartItemRow";

export default function CartPage() {
  const {
    items,
    clearCart,
    total,
    itemCount,
    isEmpty,
  } = useCart();

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">
      <h1 className="heading-1 text-center">Your Cart</h1>

      {/* Shopping Link / Empty State */}
      <div className="text-center">
        {isEmpty ? (
          <div className="py-20">
            <p className="text-lg text-[var(--color-text-secondary)] mb-6">
              Your cart is empty.
            </p>
            <Button asChild variant="primary">
              <Link href="/products">Browse Products</Link>
            </Button>
          </div>
        ) : (
          <Link
            href="/products"
            className="text-primary underline text-sm hover:opacity-80"
          >
            Continue Shopping
          </Link>
        )}
      </div>

      {!isEmpty && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <CartItemRow 
                key={item.key} 
                item={item} 
                variant="full" 
              />
            ))}
          </div>

          {/* Order Summary Card */}
          <div className="p-6 border border-[var(--color-border)] rounded-lg h-fit space-y-6 bg-[var(--color-bg-surface)]">
            <h2 className="heading-3">Order Summary</h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--color-text-secondary)]">Items ({itemCount})</span>
                <span>₦{total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-secondary)]">Shipping</span>
                <span className="text-[var(--color-success-500)]">Calculated at checkout</span>
              </div>
            </div>

            <div className="flex justify-between text-lg font-semibold border-t pt-4">
              <span>Total</span>
              <span>₦{total.toLocaleString()}</span>
            </div>

            <div className="space-y-3 pt-2">
              <Button asChild variant="primary" className="w-full">
                <Link href="/checkout/shipping">Proceed to Checkout</Link>
              </Button>

              <Button 
                variant="subtle" 
                className="w-full text-[var(--color-text-muted)] hover:text-[var(--color-danger-500)]" 
                onClick={clearCart}
              >
                Clear Cart
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}