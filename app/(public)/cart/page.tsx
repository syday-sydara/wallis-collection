"use client";

import { useCart } from "@/components/cart/CartProvider";
import CartDrawer from "@/components/cart/CartDrawer";
import CartItemRow from "@/components/cart/CartItemRow";
import Button from "@/components/ui/Button";
import { formatPrice } from "@/lib/formatters";
import { useState } from "react";

export default function CartPage() {
  const { items, itemCount, total, clearCart } = useCart();
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const handleCheckout = async () => {
    if (!items.length) return;

    setCheckoutLoading(true);

    try {
      const res = await fetch("/api/cart/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          email: "test@example.com", // replace with actual user info
          phone: "08012345678",
          fullName: "John Doe",
          address: "123 Example St",
          city: "Lagos",
          state: "Lagos",
          paymentMethod: "PAYSTACK", // or MONNIFY
        }),
      });

      const data = await res.json();

      if (data.success) {
        window.location.href = data.paymentUrl;
      } else {
        alert(data.error || "Checkout failed");
      }
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] p-6 lg:p-12">
      <h1 className="text-2xl font-bold mb-6">Your Cart ({itemCount})</h1>

      {items.length === 0 ? (
        <div className="text-center text-[var(--color-text-secondary)] mt-12">
          Your cart is empty.
        </div>
      ) : (
        <div className="flex flex-col gap-4 lg:max-w-4xl lg:mx-auto">
          {/* Cart Items */}
          {items.map((item) => (
            <CartItemRow key={item.key} item={item} variant="full" />
          ))}

          {/* Cart Summary */}
          <div className="flex justify-between items-center mt-6 p-4 bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-md">
            <span className="font-medium text-lg">Total:</span>
            <span className="font-bold text-xl">{formatPrice(total)}</span>
          </div>

          {/* Actions */}
          <div className="flex flex-col lg:flex-row gap-4 mt-6">
            <Button
              variant="primary"
              className="flex-1"
              onClick={handleCheckout}
              disabled={checkoutLoading || items.length === 0}
            >
              {checkoutLoading ? "Processing..." : "Proceed to Checkout"}
            </Button>

            <Button
              variant="subtle"
              className="flex-1"
              onClick={clearCart}
            >
              Clear Cart
            </Button>
          </div>
        </div>
      )}

      {/* Mobile Cart Drawer */}
      <CartDrawer />
    </div>
  );
}