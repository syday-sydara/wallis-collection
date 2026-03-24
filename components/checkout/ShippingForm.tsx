"use client";

import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import CheckoutProgress from "@/components/checkout/CheckoutProgress";
import { useCheckout } from "./checkoutProvider";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ShippingForm() {
  const { shipping, setShipping } = useCheckout();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleContinue = () => {
    // Basic validation
    if (shipping.type === "DELIVERY") {
      // Ensure all required delivery fields are filled in
      if (!shipping.address || !shipping.city || !shipping.state || !shipping.postalCode || !shipping.courierPhone) {
        setError("Please fill in all required delivery details.");
        return;
      }
    }

    setError(null); // Clear any existing errors

    // Navigate to payment page
    router.push("/checkout/payment");
  };

  return (
    <div className="space-y-12">
      <CheckoutProgress step={2} />

      <h1 className="heading-1 text-primary">Shipping Details</h1>

      <Card className="space-y-6">
        {/* Shipping Method */}
        <div className="space-y-2">
          <label className="text-sm text-primary font-medium">Shipping Method</label>
          <select
            value={shipping.type}
            onChange={(e) => setShipping({ type: e.target.value as "DELIVERY" | "PICKUP" })}
            className="w-full px-4 py-2 rounded-lg border border-neutral/30 text-sm focus:ring-2 focus:ring-primary/40 outline-none"
          >
            <option value="DELIVERY">Delivery</option>
            <option value="PICKUP">Pickup</option>
          </select>
        </div>

        {/* Delivery Fields */}
        {shipping.type === "DELIVERY" && (
          <>
            <Input
              label="Address"
              value={shipping.address || ""}
              onChange={(e) => setShipping({ address: e.target.value })}
            />
            <Input
              label="City"
              value={shipping.city || ""}
              onChange={(e) => setShipping({ city: e.target.value })}
            />
            <Input
              label="State"
              value={shipping.state || ""}
              onChange={(e) => setShipping({ state: e.target.value })}
            />
            <Input
              label="Postal Code"
              value={shipping.postalCode || ""}
              onChange={(e) => setShipping({ postalCode: e.target.value })}
            />
            <Input
              label="Courier Phone Number"
              value={shipping.courierPhone || ""}
              onChange={(e) => setShipping({ courierPhone: e.target.value })}
            />
            <Input
              label="Tracking Number"
              value={shipping.trackingNumber || ""}
              onChange={(e) => setShipping({ trackingNumber: e.target.value })}
            />
          </>
        )}

        {/* Pickup Info */}
        {shipping.type === "PICKUP" && (
          <p className="text-neutral text-sm">
            You will receive a WhatsApp message when your order is ready for pickup.
          </p>
        )}

        {/* Error Message */}
        {error && <p className="text-danger text-sm">{error}</p>}

        {/* Continue Button */}
        <Button className="w-full mt-4" onClick={handleContinue} disabled={shipping.type === ""}>
          Continue to Payment
        </Button>
      </Card>
    </div>
  );
}