"use client";

import { useUI } from "@/components/ui/ui-context";
import { useCart } from "@/components/cart/cart-context";
import QuantityStepper from "@/components/ui/QuantityStepper";
import Button from "@/components/ui/Button";
import Image from "next/image";
import { formatPrice } from "@/lib/formatters";

export default function CartDrawer() {
  const { cartOpen, closeCart } = useUI();
  const { items, updateQty, removeItem, subtotal } = useCart();

  return (
    <>
      {cartOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          onClick={closeCart}
        />
      )}

      <div
        className={`
          fixed top-0 right-0 h-full w-80 bg-bg shadow-xl z-50
          transform transition-transform duration-300
          ${cartOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        <div className="p-6 border-b border-neutral/20 flex justify-between">
          <h2 className="heading-3 text-primary">Your Cart</h2>
          <button onClick={closeCart}>✕</button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto h-[calc(100%-200px)]">
          {items.length === 0 && (
            <p className="text-neutral text-sm">Your cart is empty.</p>
          )}

          {items.map((item) => (
            <div key={item.id} className="flex gap-4">
              <div className="relative w-20 h-20 bg-neutral/10 rounded-lg overflow-hidden">
                <Image
                  src={item.image || "/placeholder.png"}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex-1">
                <p className="text-primary font-medium line-clamp-1">
                  {item.name}
                </p>
                <p className="text-secondary text-sm">
                  {formatPrice(item.priceCents / 100)}
                </p>

                <div className="flex justify-between mt-2">
                  <QuantityStepper
                    value={item.quantity}
                    onChange={(qty) => updateQty(item.id, qty)}
                  />
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-danger text-xs"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 border-t border-neutral/20 space-y-4">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span className="font-semibold">
              {formatPrice(subtotal / 100)}
            </span>
          </div>

          <Button className="w-full">Checkout</Button>
        </div>
      </div>
    </>
  );
}