"use client";

import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X } from "lucide-react";
import { useCart } from "./cart-context";
import { useCartUI } from "@/store/cart-ui-store";
import CartItemRow from "./CartItemRow";

export default function CartDrawer() {
  const { items, isEmpty, clearCart, total, itemCount } = useCart();
  const { isOpen, open, close } = useCartUI();

  return (
    <>
      {/* Floating Cart Button */}
      <button
        onClick={open}
        aria-label="Open cart"
        aria-expanded={isOpen}
        className="
          fixed bottom-4 right-4 z-50
          btn btn-primary rounded-full shadow-lg
          active:scale-95
        "
      >
        Cart ({itemCount})
      </button>

      <Transition.Root show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={close}>
          
          {/* Overlay */}
          <Transition.Child
            as={Fragment}
            enter="transition-opacity duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
          </Transition.Child>

          {/* Drawer */}
          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
                
                <Transition.Child
                  as={Fragment}
                  enter="transform transition duration-300"
                  enterFrom="translate-x-full"
                  enterTo="translate-x-0"
                  leave="transform transition duration-200"
                  leaveFrom="translate-x-0"
                  leaveTo="translate-x-full"
                >
                  <Dialog.Panel
                    className="
                      w-screen max-w-md
                      bg-bg-surface
                      flex flex-col
                      shadow-xl
                    "
                  >
                    
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b">
                      <Dialog.Title className="heading-3">
                        Shopping Cart
                      </Dialog.Title>

                      <button
                        onClick={close}
                        aria-label="Close cart"
                        className="p-2 rounded-md hover:bg-black/5 active:scale-95"
                      >
                        <X size={20} />
                      </button>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      
                      {isEmpty ? (
                        <div className="text-center mt-16 space-y-3">
                          <p className="text-text-secondary">
                            Your cart is empty
                          </p>

                          <button
                            onClick={close}
                            className="btn btn-primary btn-sm"
                          >
                            Continue Shopping
                          </button>
                        </div>
                      ) : (
                        items.map((item) => (
                          <CartItemRow key={item.key} item={item} />
                        ))
                      )}
                    </div>

                    {/* Footer */}
                    {!isEmpty && (
                      <div className="border-t p-4 space-y-4 pb-safe">
                        
                        <div className="flex justify-between">
                          <span className="text-text-secondary">
                            Subtotal
                          </span>
                          <span className="font-semibold">
                            ₦{total.toLocaleString()}
                          </span>
                        </div>

                        <div className="flex flex-col gap-2">
                          
                          <button className="btn btn-primary w-full">
                            Checkout
                          </button>

                          <button
                            onClick={clearCart}
                            className="btn btn-secondary w-full"
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