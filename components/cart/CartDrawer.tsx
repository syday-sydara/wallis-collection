"use client";

import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X } from "lucide-react";
import { useCart } from "./CartProvider";
import CartItemRow from "./CartItemRow";
import Button from "@/components/ui/Button";
import Link from "next/link";

export default function CartDrawer() {
  const { items, isEmpty, clearCart, total, itemCount } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open cart"
        aria-expanded={open}
        className="fixed bottom-4 right-4 z-50 rounded-full bg-[var(--color-primary-500)] text-white px-6 py-3 shadow-lg hover:scale-105 transition-transform font-medium"
      >
        Cart ({itemCount})
      </button>

      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={setOpen}>
          {/* Backdrop */}
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                <Transition.Child
                  as={Fragment}
                  enter="transform transition ease-in-out duration-300"
                  enterFrom="translate-x-full"
                  enterTo="translate-x-0"
                  leave="transform transition ease-in-out duration-300"
                  leaveFrom="translate-x-0"
                  leaveTo="translate-x-full"
                >
                  <Dialog.Panel className="pointer-events-auto w-screen max-w-md bg-[var(--color-bg-surface)] shadow-xl flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
                      <Dialog.Title className="text-lg font-semibold text-[var(--color-text-primary)]">
                        Shopping Cart
                      </Dialog.Title>
                      <button
                        className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                        onClick={() => setOpen(false)}
                        aria-label="Close cart"
                      >
                        <X size={20} />
                      </button>
                    </div>

                    {/* Scrollable Items Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                      {isEmpty ? (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                          <p className="text-[var(--color-text-secondary)]">
                            Your cart is empty.
                          </p>
                          <Button variant="subtle" onClick={() => setOpen(false)}>
                            Continue Shopping
                          </Button>
                        </div>
                      ) : (
                        items.map((item) => (
                          <CartItemRow 
                            key={item.key} 
                            item={item} 
                            variant="compact" 
                          />
                        ))
                      )}
                    </div>

                    {/* Footer / Summary */}
                    {!isEmpty && (
                      <div className="border-t border-[var(--color-border)] p-6 bg-[var(--color-bg-primary)]">
                        <div className="flex justify-between mb-6">
                          <span className="text-[var(--color-text-secondary)]">Subtotal</span>
                          <span className="font-bold text-lg">
                            ₦{total.toLocaleString()}
                          </span>
                        </div>

                        <div className="flex flex-col gap-3">
                          <Button asChild variant="primary" className="w-full">
                            <Link href="/checkout/shipping" onClick={() => setOpen(false)}>
                              Checkout
                            </Link>
                          </Button>
                          <button
                            className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-danger-500)] transition-colors py-2"
                            onClick={clearCart}
                          >
                            Clear Cart
                          </button>
                        </div>
                      </div>
                    )}
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
}