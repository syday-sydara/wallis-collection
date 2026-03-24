"use client";

import OrderConfirmationClient from "@/components/checkout/OrderConfirmation";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ConfirmationPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        const data = await res.json();
        setOrder(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (!orderId) return <p className="text-center py-20">No order found.</p>;
  if (loading) return <p className="text-center py-20">Loading order...</p>;

  return (
    <div className="max-w-3xl mx-auto py-20 px-4">
      <OrderConfirmationClient order={order} />
    </div>
  );
}