"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/cart/cart-context";
import { formatPrice } from "@/lib/formatters";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import QuantityStepper from "@/components/ui/QuantityStepper";
import CheckoutProgress from "@/components/checkout/CheckoutProgress";

export default function CartPage() {
  const { items, updateQty, removeItem, subtotal } = useCart();

  return (
    <div className="container py-20 space-y-16">

      {/* Progress Indicator */}
      <CheckoutProgress step={1} />

      {/* Page Title */}
      <h1 className="heading-1 text-primary tracking-tight">Your Cart</h1>

      {/* Empty State */}
      {items.length === 0 && (
        <div className="py-24 text-center animate-in fade-in slide-in-from-bottom-4">
          <p className="label text-neutral mb-6">Your cart is empty.</p>
          <Link href="/products" className="underline-grow text-primary label">
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
                      {formatPrice(item.priceCents / 100)}
                    </p>
                  </div>

                  {/* Quantity + Remove */}
                  <div className="flex items-center justify-between mt-4">

                    {/* Quantity Stepper */}
                    <QuantityStepper
                      value={item.quantity}
                      onChange={(qty) => updateQty(item.id, qty)}
                    />

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
          <Card className="space-y-6 h-fit">
            <h2 className="heading-3 text-primary">Order Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral">Subtotal</span>
                <span className="text-primary font-medium">
                  {formatPrice(subtotal / 100)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-neutral">Estimated Tax</span>
                <span className="text-neutral">Calculated at checkout</span>
              </div>

              <div className="flex justify-between pt-3 border-t border-neutral/20">
                <span className="label text-primary">Total</span>
                <span className="text-xl font-semibold text-primary">
                  {formatPrice(subtotal / 100)}
                </span>
              </div>
            </div>

            <Button className="w-full" variant="primary">
              Proceed to Checkout
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}