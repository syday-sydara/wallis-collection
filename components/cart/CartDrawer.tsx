'use client';

import { useEffect } from "react";
import { X, Minus, Plus, Trash } from "lucide-react";
import { useCart } from "@/lib/cart/store";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils/formatters/currency";

export function CartDrawer() {
  const { isOpen, close, items, subtotal, increaseQty, decreaseQty, removeItem } = useCart();

  /* ---------------- Scroll Lock ---------------- */
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
  }, [isOpen]);

  /* ---------------- Escape Key ---------------- */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity z-40",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={close}
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className={cn(
          "fixed right-0 top-0 h-full w-[90%] max-w-sm bg-surface shadow-xl z-50 flex flex-col transition-transform pb-safe animate-fadeIn-fast",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-text">Your Cart</h2>
          <button
            onClick={close}
            className="p-2 rounded-md hover:bg-surface-muted active:scale-press transition"
            aria-label="Close cart"
          >
            <X className="h-5 w-5 text-text-muted" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="text-center mt-10 space-y-3 animate-fadeIn-fast">
              <p className="text-text-muted text-sm">Your cart is empty</p>
              <Link href="/" onClick={close}>
                <Button variant="outline" className="min-h-touch">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-3 animate-fadeIn-fast">
                <Image
                  src={item.image}
                  alt={item.name}
                  width={64}
                  height={64}
                  className="rounded-md object-cover"
                />

                <div className="flex-1">
                  <p className="font-medium text-text">{item.name}</p>

                  {item.attributes && (
                    <p className="text-xs text-text-muted">
                      {Object.values(item.attributes).join(" / ")}
                    </p>
                  )}

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => decreaseQty(item.id)}
                      className="p-1 rounded-md bg-surface-muted hover:bg-surface active:scale-press"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-4 w-4 text-text-muted" />
                    </button>

                    <span className="text-sm font-medium">{item.quantity}</span>

                    <button
                      onClick={() => increaseQty(item.id)}
                      className="p-1 rounded-md bg-surface-muted hover:bg-surface active:scale-press"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-4 w-4 text-text-muted" />
                    </button>
                  </div>

                  <p className="text-sm font-medium text-text mt-1">
                    {formatCurrency(item.unitPrice)}
                  </p>
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeItem(item.id)}
                  className="p-1 rounded-md hover:bg-surface-muted active:scale-press"
                  aria-label="Remove item"
                >
                  <Trash className="h-4 w-4 text-danger" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border p-4 space-y-3 animate-fadeIn-fast">
            <div className="flex justify-between text-text">
              <span className="font-medium">Subtotal</span>
              <span className="font-semibold">{formatCurrency(subtotal)}</span>
            </div>

            <Link href="/checkout" onClick={close}>
              <Button fullWidth className="min-h-touch">
                Checkout
              </Button>
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
