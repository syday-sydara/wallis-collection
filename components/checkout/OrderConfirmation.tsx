// components/checkout/OrderConfirmationClient.tsx
"use client";

import React, { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { formatPrice } from "@/lib/formatters";
import Link from "next/link";
import type { Order, OrderItem } from "@prisma/client";
import Spinner from "@/components/ui/Spinner";

interface OrderConfirmationProps {
  order: Order & { items: OrderItem[] };
}

export default function OrderConfirmationClient({ order }: OrderConfirmationProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderData, setOrderData] = useState(order);

  useEffect(() => {
    try {
      // Simulate a brief client-side check/loading
      setTimeout(() => setLoading(false), 400);
    } catch (err) {
      setError("Failed to load order details.");
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  if (error || !orderData) {
    return (
      <div className="text-center py-20">
        <p className="text-danger font-medium">{error || "Order not found."}</p>
        <Link href="/checkout">
          <Button className="mt-4">Go Back to Checkout</Button>
        </Link>
      </div>
    );
  }

  const total = orderData.totalCents ?? orderData.subtotal;

  return (
    <div className="space-y-12 py-20 text-center">
      <h1 className="heading-1 text-primary">Order Confirmed</h1>
      <p className="text-neutral text-lg">
        Thank you for your purchase. Your order has been successfully placed.
      </p>
      <p className="text-primary font-medium">
        Order Number: <span className="font-semibold">{orderData.id}</span>
      </p>

      <Card className="max-w-2xl mx-auto space-y-6">
        <h2 className="heading-3 text-primary">Order Summary</h2>

        <div className="space-y-4 text-left">
          {orderData.items.map((item) => (
            <div key={item.id} className="flex justify-between">
              <span className="text-primary">
                {item.name} × {item.quantity}
              </span>
              <span className="text-secondary font-medium">
                {formatPrice((item.priceCents * item.quantity) / 100)}
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