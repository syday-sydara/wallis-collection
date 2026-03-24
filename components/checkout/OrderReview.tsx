"use client";

import { useCart } from "@/components/cart/CartProvider";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import CheckoutProgress from "@/components/checkout/CheckoutProgress";
import { formatPrice } from "@/lib/formatters";
import { useRouter } from "next/navigation";
import { useCheckout } from "./checkoutProvider";
import { useState } from "react";

export default function OrderReview() {
  const { items, total, clearCart } = useCart();
  const { shipping, payment } = useCheckout();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handlePlaceOrder = async () => {
    setLoading(true);

    const payload = {
      shipping,
      paymentMethod: payment.method,
      items: items.map((i) => ({
        id: i.id,
        quantity: i.quantity,
        priceCents: i.price * 100, // convert naira → kobo
      })),
      totalCents: total * 100,
    };

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to place order");
      }

      clearCart();
      router.push(`/checkout/confirmation?orderId=${data.orderId}`);
    } catch (error: any) {
      alert(error.message || "Something went wrong, please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      <CheckoutProgress step={4} />
      <h1 className="heading-1 text-primary">Review Your Order</h1>

      {/* Items */}
      <Card className="space-y-6 p-6">
        <h2 className="heading-3 text-primary">Items</h2>
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between">
              <span className="text-primary">
                {item.name} × {item.quantity}
              </span>
              <span className="text-secondary font-medium">
                {formatPrice(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Summary */}
      <Card className="space-y-4 p-6">
        <h2 className="heading-3 text-primary">Summary</h2>

        <div className="flex justify-between text-sm">
          <span className="text-neutral">Subtotal</span>
          <span className="text-primary font-medium">
            {formatPrice(total)}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-neutral">Shipping</span>
          <span className="text-primary font-medium">
            {shipping.type === "DELIVERY" ? "₦0 (Free)" : "Pickup"}
          </span>
        </div>

        <div className="flex justify-between pt-3 border-t border-neutral/20">
          <span className="label text-primary">Total</span>
          <span className="text-xl font-semibold text-primary">
            {formatPrice(total)}
          </span>
        </div>
      </Card>

      <Button
        className="w-full"
        onClick={handlePlaceOrder}
        disabled={loading}
      >
        {loading ? "Placing Order..." : "Place Order"}
      </Button>
    </div>
  );
}