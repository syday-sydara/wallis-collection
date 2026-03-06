"use client";

import Image from "next/image";
import { FiX } from "react-icons/fi";
import { useCart } from "@/components/cart/cart-context";
import QuantityStepper from "@/components/ui/QuantityStepper";
import Button from "@/components/ui/Button";
import { formatPrice } from "@/lib/formatters";

export default function CartDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { items, updateQty, removeItem, subtotal } = useCart();

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`
          fixed top-0 right-0 h-full w-80 bg-bg shadow-xl z-50
          transform transition-transform duration-300
          ${open ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral/20">
          <h2 className="heading-3 text-primary">Your Cart</h2>
          <button onClick={onClose} className="text-primary">
            <FiX size={24} />
          </button>
        </div>

        {/* Items */}
        <div className="p-6 space-y-6 overflow-y-auto h-[calc(100%-200px)]">
          {items.length === 0 && (
            <p className="text-neutral text-sm">Your cart is empty.</p>
          )}

          {items.map((item) => (
            <div key={item.id} className="flex gap-4">
              <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-neutral/10">
                <Image
                  src={item.image || "/placeholder.png"}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-primary font-medium text-sm line-clamp-1">
                    {item.name}
                  </p>
                  <p className="text-secondary text-sm">
                    {formatPrice(item.priceCents / 100)}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <QuantityStepper
                    value={item.quantity}
                    onChange={(qty) => updateQty(item.id, qty)}
                  />

                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-danger text-xs hover:text-danger/70"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-neutral/20 space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-neutral">Subtotal</span>
            <span className="text-primary font-semibold">
              {formatPrice(subtotal / 100)}
            </span>
          </div>

          <Button className="w-full" variant="primary">
            Checkout
          </Button>
        </div>
      </div>
    </>
  );
}