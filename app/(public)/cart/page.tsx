"use client";

import { useCart } from "@/components/cart/CartProvider";
import CartItemRow from "@/components/cart/CartItemRow";
import CartDrawer from "@/components/cart/CartDrawer";
import Button from "@/components/ui/Button";
import { formatPrice } from "@/lib/formatters";
import { useState } from "react";
import Link from "next/link";

export default function CartPage() {
  const { items, total, itemCount, isEmpty, clearCart } = useCart();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cart/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          email: "customer@example.com", // replace with actual form input
          phone: "08012345678",
          fullName: "John Doe",
          address: "123 Street",
          city: "Lagos",
          state: "Lagos",
          paymentMethod: "PAYSTACK", // or "MONNIFY"
        }),
      });

      const data = await res.json();
      if (data.success) {
        window.location.href = data.paymentUrl || `/order/success/${data.orderId}`;
      } else {
        alert(data.error || "Checkout failed");
      }
    } catch (err) {
      console.error(err);
      alert("Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
        <Button asChild>
          <Link href="/products">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>

      <div className="grid grid-cols-1 gap-4">
        {items.map((item) => (
          <CartItemRow key={item.key} item={item} variant="full" maxStock={item.quantity} />
        ))}
      </div>

      <div className="mt-8 flex flex-col md:flex-row justify-between items-center border-t pt-6">
        <div className="text-lg font-semibold">
          Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"}): <span>{formatPrice(total)}</span>
        </div>

        <div className="flex gap-3 mt-4 md:mt-0">
          <Button onClick={handleCheckout} disabled={loading}>
            {loading ? "Processing..." : "Proceed to Checkout"}
          </Button>
          <Button variant="ghost" onClick={clearCart}>
            Clear Cart
          </Button>
        </div>
      </div>
    </div>
  );
}