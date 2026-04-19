'use client';

import { useEffect } from "react";
import { X } from "lucide-react";
import { useCart } from "@/lib/cart/store";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils/formatters/currency";

export function CartDrawer() {
  const { isOpen, close, items, subtotal } = useCart();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity z-40",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={close}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className={cn(
          "fixed right-0 top-0 h-full w-[90%] max-w-sm bg-surface shadow-xl z-50 flex flex-col transition-transform pb-safe animate-fadeIn-fast",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-border-subtle">
          <h2 className="text-lg font-semibold text-text">Your Cart</h2>
          <button
            onClick={close}
            className="p-2 rounded-md hover:bg-surface-muted active:scale-press transition"
            aria-label="Close cart"
          >
            <X className="h-5 w-5 text-text-muted" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <p className="text-text-muted text-sm text-center mt-10">
              Your cart is empty
            </p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-3">
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
                  <p className="text-sm text-text-muted mt-1">
                    Qty: {item.quantity}
                  </p>
                  <p className="text-sm font-medium text-text mt-1">
                    {formatCurrency(item.unitPrice)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border-subtle p-4 space-y-3">
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