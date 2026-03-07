// components/checkout/OrderConfirmation.tsx
"use client";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { formatPrice } from "@/lib/formatters";
import Link from "next/link";
import type { Order, OrderItem } from "@prisma/client";

export default function OrderConfirmation({
  order,
}: {
  order: Order & { items: OrderItem[] };
}) {
  const total = order.total ?? order.subtotal;

  return (
    <div className="space-y-12 py-20 text-center">
      <h1 className="heading-1 text-primary">Order Confirmed</h1>

      <p className="text-neutral text-lg">
        Thank you for your purchase. Your order has been successfully placed.
      </p>

      <p className="text-primary font-medium">
        Order Number: <span className="font-semibold">{order.id}</span>
      </p>

      <Card className="max-w-2xl mx-auto space-y-6">
        <h2 className="heading-3 text-primary">Order Summary</h2>

        <div className="space-y-4 text-left">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between">
              <span className="text-primary">
                {item.name} × {item.quantity}
              </span>
              <span className="text-secondary font-medium">
                {formatPrice((item.price * item.quantity) / 100)}
              </span>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-neutral/20 flex justify-between">
          <span className="label text-primary">Total</span>
          <span className="text-xl font-semibold text-primary">
            {formatPrice(total / 100)}
          </span>
        </div>
      </Card>

      <Link href="/products">
        <Button className="mt-6">Continue Shopping</Button>
      </Link>
    </div>
  );
}