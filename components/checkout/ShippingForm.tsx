"use client";

import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import CheckoutProgress from "@/components/checkout/CheckoutProgress";
import { useState } from "react";

export default function ShippingForm() {
  const [shippingType, setShippingType] = useState<"DELIVERY" | "PICKUP">(
    "DELIVERY"
  );

  return (
    <div className="space-y-12">
      <CheckoutProgress step={2} />

      <h1 className="heading-1 text-primary">Shipping Details</h1>

      <Card className="space-y-6">
        {/* Shipping Type */}
        <div className="space-y-2">
          <label className="text-sm text-primary font-medium">
            Shipping Method
          </label>

          <select
            value={shippingType}
            onChange={(e) =>
              setShippingType(e.target.value as "DELIVERY" | "PICKUP")
            }
            className="w-full px-4 py-2 rounded-lg border border-neutral/30 text-sm focus:ring-2 focus:ring-primary/40 outline-none"
          >
            <option value="DELIVERY">Delivery</option>
            <option value="PICKUP">Pickup</option>
          </select>
        </div>

        {/* Delivery Fields */}
        {shippingType === "DELIVERY" && (
          <>
            <Input label="Address" placeholder="123 Street Name" />
            <Input label="City" placeholder="Lagos" />
            <Input label="State" placeholder="LA" />
            <Input label="Postal Code" placeholder="100001" />
            <Input label="Courier Phone Number" placeholder="+234 801 234 5678" />
            <Input label="Tracking Number" placeholder="WLS-9834721" />
          </>
        )}

        {/* Pickup Fields */}
        {shippingType === "PICKUP" && (
          <p className="text-neutral text-sm">
            You will receive a WhatsApp message when your order is ready for pickup.
          </p>
        )}

        <Button className="w-full mt-4">Continue to Payment</Button>
      </Card>
    </div>
  );
}