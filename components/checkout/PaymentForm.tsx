"use client";

import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import CheckoutProgress from "@/components/checkout/CheckoutProgress";

export default function PaymentForm() {
  return (
    <div className="space-y-12">
      <CheckoutProgress step={3} />

      <h1 className="heading-1 text-primary">Payment</h1>

      <Card className="space-y-6">
        {/* Payment Method */}
        <div className="space-y-2">
          <label className="text-sm text-primary font-medium">
            Payment Method
          </label>

          <select className="w-full px-4 py-2 rounded-lg border border-neutral/30 text-sm focus:ring-2 focus:ring-primary/40 outline-none">
            <option value="CARD">Credit / Debit Card</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
            <option value="PAY_ON_DELIVERY">Pay on Delivery</option>
          </select>
        </div>

        {/* Card Fields */}
        <Input label="Card Number" placeholder="1234 5678 9012 3456" />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Expiry" placeholder="MM/YY" />
          <Input label="CVV" placeholder="123" />
        </div>

        <Button className="w-full mt-4">Review Order</Button>
      </Card>
    </div>
  );
}