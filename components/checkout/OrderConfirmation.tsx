"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { formatPrice } from "@/lib/formatters/formatters";
import Link from "next/link";
import Spinner from "@/components/ui/Spinner";
import type { Order, OrderItem, Shipment, ShipmentUpdate } from "@prisma/client";

interface OrderConfirmationProps {
  order: Order & {
    items: (OrderItem & {
      product: {
        name: string;
        priceNaira: number;
        images: { url: string }[];
      };
    })[];
    shipments: (Shipment & { updates: ShipmentUpdate[] })[];
  };
}

export default function OrderConfirmationClient({ order }: OrderConfirmationProps) {
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState(order);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setTimeout(() => setLoading(false), 400);
    } catch {
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

  const total = orderData.totalCents / 100;

  const latestShipment = orderData.shipments?.[0];
  const latestUpdate = latestShipment?.updates?.[latestShipment.updates.length - 1];

  return (
    <div className="space-y-12 py-20 text-center">
      <h1 className="heading-1 text-primary">Order Confirmed</h1>

      <p className="text-neutral text-lg">
        Thank you for your purchase. Your order has been successfully placed.
      </p>

      <p className="text-primary font-medium">
        Order Number: <span className="font-semibold">{orderData.id}</span>
      </p>

      {/* Shipment Status */}
      {latestShipment ? (
        <Card className="max-w-xl mx-auto p-6 space-y-3">
          <h3 className="heading-4 text-primary">Shipment Status</h3>
          <p className="text-neutral">{latestUpdate?.status || latestShipment.status}</p>
          {latestUpdate?.note && <p className="text-sm text-neutral/70">{latestUpdate.note}</p>}
        </Card>
      ) : (
        <p className="text-neutral">No shipment details available.</p>
      )}

      {/* Order Summary */}
      <Card className="max-w-2xl mx-auto space-y-6 p-6">
        <h2 className="heading-3 text-primary">Order Summary</h2>

        <div className="space-y-4 text-left">
          {orderData.items.length === 0 ? (
            <p>No items in this order.</p>
          ) : (
            orderData.items.map((item) => {
              const image = item.product.images?.[0]?.url || "/placeholder.png";

              return (
                <div key={item.id} className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="relative w-14 h-14 rounded-md overflow-hidden">
                      <Image
                        src={image}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    </div>
                    <span className="text-primary">
                      {item.product.name} × {item.quantity}
                    </span>
                  </div>

                  <span className="text-secondary font-medium">
                    {formatPrice((item.priceCents * item.quantity) / 100)}
                  </span>
                </div>
              );
            })
          )}
        </div>

        <div className="pt-4 border-t border-neutral/20 flex justify-between">
          <span className="label text-primary">Total</span>
          <span className="text-xl font-semibold text-primary">{formatPrice(total)}</span>
        </div>
      </Card>

      <Link href="/products">
        <Button className="mt-6">Continue Shopping</Button>
      </Link>
    </div>
  );
}