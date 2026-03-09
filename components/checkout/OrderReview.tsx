"use client";

import { useCart } from "@/components/cart/cart-context";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import CheckoutProgress from "@/components/checkout/CheckoutProgress";
import { formatPrice } from "@/lib/formatters";
import { createOrder } from "@/lib/actions/createOrder";
import { useRouter } from "next/navigation";
import { useCheckout } from "./checkout-context";

export default function OrderReview() {
  const { items, subtotal, clear } = useCart();
  const { shipping, payment } = useCheckout();
  const router = useRouter();

  const handlePlaceOrder = async () => {
    const orderId = await createOrder({
      ...shipping,
      ...payment,
      items,
      subtotal,
    });

    clear();
    router.push(`/checkout/confirmation?orderId=${orderId}`);
  };

  return (
    <div className="space-y-12">
      <CheckoutProgress step={4} />
      <h1 className="heading-1 text-primary">Review Your Order</h1>

      {/* Items */}
      <Card className="space-y-6">
        <h2 className="heading-3 text-primary">Items</h2>
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between">
              <span className="text-primary">{item.name} × {item.quantity}</span>
              <span className="text-secondary font-medium">{formatPrice(item.priceCents * item.quantity / 100)}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Summary */}
      <Card className="space-y-4">
        <h2 className="heading-3 text-primary">Summary</h2>
        <div className="flex justify-between text-sm">
          <span className="text-neutral">Subtotal</span>
          <span className="text-primary font-medium">{formatPrice(subtotal / 100)}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-neutral">Shipping</span>
          <span className="text-primary font-medium">{shipping.type === "DELIVERY" ? "₦0 (Free)" : "Pickup"}</span>
        </div>

        <div className="flex justify-between pt-3 border-t border-neutral/20">
          <span className="label text-primary">Total</span>
          <span className="text-xl font-semibold text-primary">{formatPrice(subtotal / 100)}</span>
        </div>
      </Card>

      <Button className="w-full" onClick={handlePlaceOrder}>Place Order</Button>
    </div>
  );
}