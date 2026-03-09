"use client";

import { useCart } from "./cart-context";
import { useState } from "react";
import Button from "@/components/ui/Button";
import { X } from "lucide-react";

export default function CartDrawer() {
  const { items, removeItem, updateQuantity, clearCart, total } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Cart toggle button */}
      <button
        className="fixed top-5 right-5 z-50 bg-[var(--color-primary-500)] text-white px-4 py-2 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:opacity-90 transition"
        onClick={() => setIsOpen(true)}
      >
        Cart ({items.length})
      </button>

      {/* Drawer overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer panel */}
      <div
        className={`fixed top-0 right-0 h-full w-96 bg-[var(--color-bg-surface)] shadow-[0_2px_12px_rgba(0,0,0,0.15)] z-50 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } flex flex-col`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-[var(--color-border)]">
          <h2 className="heading-2">Your Cart</h2>
          <button onClick={() => setIsOpen(false)} className="hover:opacity-70">
            <X size={20} />
          </button>
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 && (
            <p className="text-[var(--color-text-secondary)] text-center mt-10">
              Your cart is empty.
            </p>
          )}

          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-4">
              {item.image && (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-md"
                />
              )}

              <div className="flex-1">
                <h3 className="font-medium">{item.name}</h3>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  ₦{item.price.toLocaleString()}
                </p>

                {/* Quantity controls */}
                <div className="flex items-center mt-1 space-x-2">
                  <button
                    onClick={() =>
                      updateQuantity(item.id, Math.max(1, item.quantity - 1))
                    }
                    className="px-2 py-1 border border-[var(--color-border)] rounded hover:bg-[var(--color-bg-primary)] transition"
                  >
                    -
                  </button>

                  <span>{item.quantity}</span>

                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="px-2 py-1 border border-[var(--color-border)] rounded hover:bg-[var(--color-bg-primary)] transition"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Remove item */}
              <button
                onClick={() => removeItem(item.id)}
                className="text-[var(--color-danger-500)] hover:opacity-70"
              >
                <X size={18} />
              </button>
            </div>
          ))}
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
              onClick={() => alert("Checkout flow not implemented yet")}
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
      </div>
    </>
  );
}
