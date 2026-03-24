"use client";

import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X } from "lucide-react";
import { useCart } from "./cart-context";
import CartItemRow from "./CartItemRow";

interface CartDrawerProps {}

export default function CartDrawer({}: CartDrawerProps) {
  const { items, isEmpty, clearCart, totalCents, itemCount } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Button to open drawer (could be in header) */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-50 rounded-full bg-[var(--color-primary-500)] text-white px-4 py-3 shadow-lg"
        aria-label="Open cart"
      >
        Cart ({itemCount})
      </button>

      {/* Drawer */}
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={setOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30" />
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
                      <Dialog.Title className="text-lg font-medium">
                        Shopping Cart
                      </Dialog.Title>
                      <button
                        className="text-gray-500 hover:text-gray-700"
                        onClick={() => setOpen(false)}
                        aria-label="Close cart"
                      >
                        <X size={20} />
                      </button>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                      {isEmpty ? (
                        <p className="text-[var(--color-text-secondary)]">
                          Your cart is empty.
                        </p>
                      ) : (
                        items.map((item) => (
                          <CartItemRow key={item.key} item={item} />
                        ))
                      )}
                    </div>

                    {/* Footer */}
                    {!isEmpty && (
                      <div className="border-t border-[var(--color-border)] p-6">
                        <div className="flex justify-between mb-4">
                          <span className="font-medium">Subtotal:</span>
                          <span className="font-semibold">
                            ₦{(totalCents / 100).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex flex-col gap-2">
                          <button className="btn btn-primary w-full">
                            Checkout
                          </button>
                          <button
                            className="btn w-full bg-gray-200 hover:bg-gray-300 text-[var(--color-text-primary)]"
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