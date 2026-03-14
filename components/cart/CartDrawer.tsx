"use client";

import { useCart } from "./cart-context";
import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import { X } from "lucide-react";

export default function CartDrawer() {
  const { items, removeItem, increment, decrement, clearCart, total } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    const openHandler = () => setIsOpen(true);
    window.addEventListener("open-cart", openHandler);
    return () => window.removeEventListener("open-cart", openHandler);
  }, []);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-80 sm:w-96 bg-[var(--color-bg-surface)] shadow-xl z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } flex flex-col`}
      >
        <div className="flex justify-between items-center p-4 border-b border-[var(--color-border)]">
          <h2 className="heading-2">Your Cart</h2>
          <button onClick={() => setIsOpen(false)} className="hover:opacity-70">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 && (
            <p className="text-[var(--color-text-secondary)] text-center mt-10">
              Your cart is empty.
            </p>
          )}

          {items.map((item) => (
            <div key={item.key} className="flex items-center gap-4">
              {item.image && (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-md"
                />
              )}

              <div className="flex-1">
                <h3 className="font-medium">{item.name}</h3>

                {item.variants && (
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {Object.entries(item.variants)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(", ")}
                  </p>
                )}

                <p className="text-sm text-[var(--color-text-secondary)]">
                  ₦{(item.price ?? 0).toLocaleString()}
                </p>

                <div className="flex items-center mt-1 space-x-2">
                  <button
                    onClick={() => decrement(item.key)}
                    className="px-2 py-1 border border-[var(--color-border)] rounded hover:bg-[var(--color-bg-primary)] transition"
                  >
                    -
                  </button>

                  <span>{item.quantity}</span>

                  <button
                    onClick={() => increment(item.key)}
                    className="px-2 py-1 border border-[var(--color-border)] rounded hover:bg-[var(--color-bg-primary)] transition"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={() => removeItem(item.key)}
                className="text-[var(--color-danger-500)] hover:opacity-70"
              >
                <X size={18} />
              </button>
            </div>
          ))}
        </div>

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
      </div>
    </>
  );
}