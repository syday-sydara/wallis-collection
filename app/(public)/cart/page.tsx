"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { formatPrice } from "@/lib/formatters";

type CartItem = {
  id: string;
  name: string;
  priceCents: number;
  quantity: number;
  image: string | null;
};

export default function CartPage() {
  // TEMPORARY MOCK DATA — replace with real cart state later
  const [items, setItems] = useState<CartItem[]>([
    {
      id: "1",
      name: "Executive Wax Jacket",
      priceCents: 12900,
      quantity: 1,
      image: "/placeholder.png",
    },
    {
      id: "2",
      name: "Heritage Leather Bag",
      priceCents: 18900,
      quantity: 2,
      image: "/placeholder.png",
    },
  ]);

  const updateQty = (id: string, qty: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, qty) } : item
      )
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const subtotal = items.reduce(
    (sum, item) => sum + item.priceCents * item.quantity,
    0
  );

  return (
    <div className="container py-20 space-y-16">

      {/* Page Title */}
      <h1 className="heading-1 text-primary tracking-tight">Your Cart</h1>

      {/* Empty State */}
      {items.length === 0 && (
        <div className="py-24 text-center">
          <p className="label text-neutral mb-6">Your cart is empty.</p>
          <Link
            href="/products"
            className="underline-grow text-primary label"
          >
            Continue Shopping
          </Link>
        </div>
      )}

      {/* Cart Items */}
      {items.length > 0 && (
        <div className="grid lg:grid-cols-3 gap-16">

          {/* Line Items */}
          <div className="lg:col-span-2 space-y-8">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex gap-6 border-b border-neutral/20 pb-8"
              >
                {/* Image */}
                <div className="relative w-28 h-28 rounded-lg overflow-hidden bg-neutral/10">
                  <Image
                    src={item.image || "/placeholder.png"}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="heading-3 text-primary text-base line-clamp-1">
                      {item.name}
                    </h3>
                    <p className="text-secondary font-semibold mt-1">
                      {formatPrice(item.priceCents)}
                    </p>
                  </div>

                  {/* Quantity + Remove */}
                  <div className="flex items-center justify-between mt-4">

                    {/* Quantity Stepper */}
                    <div className="flex items-center border border-neutral/40 rounded-lg overflow-hidden">
                      <button
                        onClick={() =>
                          updateQty(item.id, item.quantity - 1)
                        }
                        className="px-3 py-2 text-primary hover:bg-neutral/10 transition"
                      >
                        –
                      </button>

                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) =>
                          updateQty(item.id, Number(e.target.value))
                        }
                        className="w-12 text-center py-2 text-sm border-l border-r border-neutral/20 focus:outline-none"
                      />

                      <button
                        onClick={() =>
                          updateQty(item.id, item.quantity + 1)
                        }
                        className="px-3 py-2 text-primary hover:bg-neutral/10 transition"
                      >
                        +
                      </button>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="label text-danger hover:text-danger/70 transition"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="border border-neutral/20 rounded-xl p-6 shadow-soft space-y-6 h-fit">
            <h2 className="heading-3 text-primary">Order Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral">Subtotal</span>
                <span className="text-primary font-medium">
                  {formatPrice(subtotal)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-neutral">Estimated Tax</span>
                <span className="text-neutral">Calculated at checkout</span>
              </div>

              <div className="flex justify-between pt-3 border-t border-neutral/20">
                <span className="label text-primary">Total</span>
                <span className="text-xl font-semibold text-primary">
                  {formatPrice(subtotal)}
                </span>
              </div>
            </div>

            <button className="w-full bg-primary text-bg py-3 rounded-xl text-sm font-medium tracking-wide hover:opacity-90 transition">
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}