"use client";

import { useCart } from "./cart-context";
import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import { X } from "lucide-react";
import CartItemRow from "./CartItemRow";

export default function CartDrawer() {
  const { items, clearCart, total } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  /* Close on ESC */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  /* Open via custom event */
  useEffect(() => {
    const openHandler = () => setIsOpen(true);
    window.addEventListener("open-cart", openHandler);
    return () => window.removeEventListener("open-cart", openHandler);
  }, []);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 h-full w-80 sm:w-96 bg-[var(--color-bg-surface)] shadow-xl z-50 transform transition-transform duration-300 ease-out flex flex-col`}
        style={{ transform: isOpen ? "translateX(0)" : "translateX(100%)" }}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-[var(--color-border)]">
          <h2 className="heading-2">Your Cart</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="hover:opacity-70"
            aria-label="Close cart drawer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <p className="text-[var(--color-text-secondary)] text-center mt-10">
              Your cart is empty.
            </p>
          ) : (
            items.map((item) => <CartItemRow key={item.key} item={item} />)
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 border-t border-[var(--color-border)]">
            <div className="flex justify-between items-center mb-4">
              <span className="font-medium">Total:</span>
              <span className="font-bold text-lg">
                ₦{total.toLocaleString()}
              </span>
            </div>

            <Button
              variant="primary"
              className="w-full"
              onClick={() => alert("Checkout flow coming soon")}
            >
              Checkout
            </Button>

            <Button
              variant="subtle"
              className="w-full mt-2"
              onClick={clearCart}
            >
              Clear Cart
            </Button>
          </div>
        )}
      </aside>
    </>
  );
}