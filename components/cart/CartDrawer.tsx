"use client";

import { Fragment, useState, useEffect, useCallback } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X } from "lucide-react";
import { useCart } from "./CartProvider";
import CartItemRow from "./CartItemRow";
import Button from "@/components/ui/Button";
import Link from "next/link";

export default function CartDrawer() {
  const { items, isEmpty, clearCart, total, itemCount } = useCart();
  const [open, setOpen] = useState(false);

  const closeDrawer = useCallback(() => setOpen(false), []);

  // Listen for global "open-cart" event
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("open-cart", handler);
    return () => window.removeEventListener("open-cart", handler);
  }, []);

  // Prevent background scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  // Close on Escape for desktop sidebar
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      {/* ---------------- MOBILE DRAWER ---------------- */}
      <Transition show={open} as={Fragment}>
        <Dialog as="div" className="relative z-[9999]" onClose={closeDrawer}>
          {/* Backdrop */}
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
          </Transition.Child>

          {/* Drawer Panel */}
          <div className="fixed inset-0 flex justify-end">
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-out duration-300"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in duration-200"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <Dialog.Panel
                className="
                  w-full max-w-sm h-full flex flex-col shadow-xl border-l
                  bg-[var(--color-bg-primary)] border-[var(--color-border)]
                "
                data-cart-open={open}
              >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
                  <Dialog.Title className="text-lg font-semibold">
                    Shopping Cart
                  </Dialog.Title>
                  <button
                    onClick={closeDrawer}
                    aria-label="Close cart"
                    className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition"
                  >
                    <X size={22} />
                  </button>
                </div>

                {/* Items */}
                <div
                  className="flex-1 overflow-y-auto p-4 space-y-4"
                  aria-live="polite"
                >
                  {isEmpty ? (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                      <p>Your cart is empty.</p>
                      <Button asChild>
                        <Link href="/shop">Continue Shopping</Link>
                      </Button>
                    </div>
                  ) : (
                    items.map((item) => (
                      <CartItemRow key={item.key} item={item} variant="compact" />
                    ))
                  )}
                </div>

                {/* Footer */}
                {!isEmpty && (
                  <div className="border-t border-[var(--color-border)] p-4 bg-[var(--color-bg-surface)]">
                    <div className="flex justify-between mb-4">
                      <span className="text-sm">
                        Subtotal ({itemCount} items)
                      </span>
                      <span className="font-bold text-lg">
                        ₦{total.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex flex-col gap-3">
                      <Button asChild>
                        <Link href="/cart/checkout">Proceed to Checkout</Link>
                      </Button>

                      <Button variant="ghost" onClick={clearCart}>
                        Clear Cart
                      </Button>
                    </div>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      {/* ---------------- DESKTOP SIDEBAR ---------------- */}
      {open && (
        <div
          className="
            hidden lg:flex lg:flex-col lg:w-96 lg:fixed lg:inset-y-0 lg:right-0
            bg-[var(--color-bg-primary)] border-l border-[var(--color-border)]
            z-[9999] animate-slide-in
          "
          data-cart-open={open}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
            <h2 className="text-lg font-semibold">Shopping Cart</h2>
            <button
              onClick={closeDrawer}
              aria-label="Close cart"
              className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4" aria-live="polite">
            {isEmpty ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <p>Your cart is empty.</p>
                <Button asChild>
                  <Link href="/shop">Continue Shopping</Link>
                </Button>
              </div>
            ) : (
              items.map((item) => (
                <CartItemRow key={item.key} item={item} variant="compact" />
              ))
            )}
          </div>

          {/* Footer */}
          {!isEmpty && (
            <div className="border-t border-[var(--color-border)] p-6 bg-[var(--color-bg-surface)]">
              <div className="flex justify-between mb-6">
                <span>Subtotal ({itemCount})</span>
                <span className="font-bold text-lg">
                  ₦{total.toLocaleString()}
                </span>
              </div>

              <div className="flex flex-col gap-3">
                <Button asChild>
                  <Link href="/cart/checkout">Proceed to Checkout</Link>
                </Button>

                <Button variant="ghost" onClick={clearCart}>
                  Clear Cart
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
