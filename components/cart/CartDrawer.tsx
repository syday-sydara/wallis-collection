"use client";

import { Fragment, useState, useCallback } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X } from "lucide-react";
import { useCart } from "./CartProvider";
import CartItemRow from "./CartItemRow";
import Button from "@/components/ui/Button";
import Link from "next/link";

export default function CartDrawer() {
  const { items, isEmpty, clearCart, total, itemCount } = useCart();
  const [open, setOpen] = useState(false);

  const toggleDrawer = useCallback(() => setOpen(prev => !prev), []);
  const closeDrawer = useCallback(() => setOpen(false), []);

  const desktopSidebar = (
    <div className="hidden lg:flex lg:flex-col lg:w-96 lg:border-l lg:bg-white lg:fixed lg:inset-y-0 lg:right-0">
      <div className="flex items-center justify-between p-6 border-b">
        <h2 className="text-lg font-semibold">Shopping Cart</h2>
        <button onClick={clearCart} aria-label="Clear cart"><X size={20} /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <p>Your cart is empty.</p>
            <Button variant="subtle"><Link href="/products">Continue Shopping</Link></Button>
          </div>
        ) : items.map(item => <CartItemRow key={item.key} item={item} variant="compact" maxStock={item.quantity} />)}
      </div>

      {!isEmpty && (
        <div className="border-t p-6 bg-gray-50">
          <div className="flex justify-between mb-6">
            <span>Subtotal ({itemCount})</span>
            <span className="font-bold text-lg">₦{total.toLocaleString()}</span>
          </div>

          <div className="flex flex-col gap-3">
            <Button asChild><Link href="/cart/checkout">Proceed to Checkout</Link></Button>
            <Button variant="ghost" onClick={clearCart}>Clear Cart</Button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <button onClick={toggleDrawer}>Cart ({itemCount})</button>
      {desktopSidebar}
    </>
  );
}