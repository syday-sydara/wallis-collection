"use client";

import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X } from "lucide-react";
import { useCart } from "./CartProvider";
import CartItemRow from "./CartItemRow";

export default function CartDrawer() {
  const { items, isEmpty, clearCart, total, itemCount } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open cart"
        className="fixed bottom-4 right-4 z-50 rounded-full bg-[var(--color-primary-500)] text-white px-4 py-3 shadow-lg hover:scale-105 transition-transform"
      >
        Cart ({itemCount})
      </button>

      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={setOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity duration-300"
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
                    <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
                      <Dialog.Title className="text-lg font-medium">Shopping Cart</Dialog.Title>
                      <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-gray-700">
                        <X size={20} />
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
                      {isEmpty ? (
                        <p className="text-[var(--color-text-secondary)] text-center mt-10">Your cart is empty.</p>
                      ) : (
                        items.map((item) => <CartItemRow key={item.key} item={item} />)
                      )}
                    </div>

                    {!isEmpty && (
                      <div className="border-t border-[var(--color-border)] p-6">
                        <div className="flex justify-between mb-4">
                          <span className="font-medium">Subtotal:</span>
                          <span className="font-semibold">₦{total.toLocaleString()}</span>
                        </div>
                        <div className="flex flex-col gap-2">
                          <button className="btn btn-primary w-full">Checkout</button>
                          <button onClick={clearCart} className="btn w-full bg-gray-200 hover:bg-gray-300 text-[var(--color-text-primary)]">
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