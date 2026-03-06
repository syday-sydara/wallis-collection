"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/formatters";

export default function Page() {
  // TEMP: Replace with real cart + user data
  const [cart] = useState([
    { id: "1", name: "Executive Wax Jacket", priceCents: 12900, qty: 1 },
    { id: "2", name: "Heritage Leather Bag", priceCents: 18900, qty: 2 },
  ]);

  const subtotal = cart.reduce(
    (sum, item) => sum + item.priceCents * item.qty,
    0
  );

  return (
    <div className="container py-20 space-y-16">

      {/* Page Title */}
      <h1 className="heading-1 text-primary tracking-tight">
        Checkout
      </h1>

      <div className="grid lg:grid-cols-3 gap-16">

        {/* LEFT: Checkout Form */}
        <div className="lg:col-span-2 space-y-12">

          {/* Shipping Info */}
          <section className="space-y-6">
            <h2 className="heading-3 text-primary">Shipping Information</h2>

            <div className="grid sm:grid-cols-2 gap-6">
              <input
                placeholder="First Name"
                className="input"
              />
              <input
                placeholder="Last Name"
                className="input"
              />
            </div>

            <input
              placeholder="Email Address"
              className="input"
            />

            <input
              placeholder="Phone Number"
              className="input"
            />

            <input
              placeholder="Street Address"
              className="input"
            />

            <div className="grid sm:grid-cols-2 gap-6">
              <input placeholder="City" className="input" />
              <input placeholder="Postal Code" className="input" />
            </div>
          </section>

          {/* Payment Info */}
          <section className="space-y-6">
            <h2 className="heading-3 text-primary">Payment</h2>

            <div className="p-6 border border-neutral/20 rounded-xl shadow-soft text-neutral">
              Payment integration goes here (Stripe, Paystack, Flutterwave…)
            </div>
          </section>

        </div>

        {/* RIGHT: Order Summary */}
        <div className="border border-neutral/20 rounded-xl p-6 shadow-soft space-y-6 h-fit">
          <h2 className="heading-3 text-primary">Order Summary</h2>

          <div className="space-y-4 text-sm">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex justify-between border-b border-neutral/20 pb-3"
              >
                <span className="text-primary">{item.name}</span>
                <span className="text-secondary font-medium">
                  {item.qty} × {formatPrice(item.priceCents)}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral">Subtotal</span>
              <span className="text-primary font-medium">
                {formatPrice(subtotal)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-neutral">Shipping</span>
              <span className="text-neutral">Calculated at next step</span>
            </div>

            <div className="flex justify-between pt-3 border-t border-neutral/20">
              <span className="label text-primary">Total</span>
              <span className="text-xl font-semibold text-primary">
                {formatPrice(subtotal)}
              </span>
            </div>
          </div>

          <button className="w-full bg-primary text-bg py-3 rounded-xl text-sm font-medium tracking-wide hover:opacity-90 transition">
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
}