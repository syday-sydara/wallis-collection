// app/checkout/page.tsx
import React from "react";
import { useForm } from "react-hook-form";
import { FormContextProvider, InputField, SelectField, CheckboxField, SubmitButton } from "@/components/ui/form";
import { useCart } from "@/components/cart/CartProvider";
import { PaymentMethod } from "@prisma/client";

type CheckoutFormValues = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  paymentMethod: PaymentMethod;
  terms: boolean;
};

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();

  const methods = useForm<CheckoutFormValues>({
    mode: "onChange",
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      paymentMethod: "COD",
      terms: false,
    },
  });

  const onSubmit = async (data: CheckoutFormValues) => {
    if (!items.length) return alert("Your cart is empty.");

    const payload = {
      ...data,
      items: items.map((i) => ({
        id: i.productId,
        quantity: i.quantity,
        priceNaira: i.price,
        variants: i.variants || {},
        key: i.productId,
      })),
    };

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) return alert(result.error || "Checkout failed");

      if (result.paymentUrl) window.location.href = result.paymentUrl;
      else alert("Order placed successfully (COD)");

      clearCart();
    } catch (err) {
      console.error(err);
      alert("Something went wrong during checkout.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-10">
      <h1 className="heading-1 text-center">Checkout</h1>

      <FormContextProvider methods={methods} onSubmit={onSubmit}>
        {/* Customer Info */}
        <div className="space-y-4 p-6 border rounded-lg bg-[var(--color-bg-surface)]">
          <h2 className="heading-3 mb-4">Customer Information</h2>
          <InputField name="fullName" label="Full Name" rules={{ required: true }} />
          <InputField name="email" label="Email" type="email" rules={{ required: true }} />
          <InputField name="phone" label="Phone Number" rules={{ required: true }} />
        </div>

        {/* Shipping Address */}
        <div className="space-y-4 p-6 border rounded-lg bg-[var(--color-bg-surface)]">
          <h2 className="heading-3 mb-4">Shipping Address</h2>
          <InputField name="address" label="Street Address" rules={{ required: true }} />
          <InputField name="city" label="City" rules={{ required: true }} />
          <InputField name="state" label="State" rules={{ required: true }} />
        </div>

        {/* Payment Method */}
        <div className="space-y-4 p-6 border rounded-lg bg-[var(--color-bg-surface)]">
          <h2 className="heading-3 mb-4">Payment Method</h2>
          <SelectField
            name="paymentMethod"
            label="Select Payment Method"
            options={[
              { value: PaymentMethod.PAYSTACK, label: "Paystack" },
              { value: PaymentMethod.MONNIFY, label: "Monnify" },
              { value: PaymentMethod.COD, label: "Cash on Delivery" },
            ]}
            rules={{ required: true }}
          />
        </div>

        {/* Order Summary */}
        <div className="space-y-4 p-6 border rounded-lg bg-[var(--color-bg-surface)]">
          <h2 className="heading-3 mb-4">Order Summary</h2>
          {items.map((item) => (
            <div key={item.key} className="flex justify-between text-sm">
              <span>{item.name} × {item.quantity}</span>
              <span>₦{(item.price * item.quantity).toLocaleString()}</span>
            </div>
          ))}
          <div className="flex justify-between text-lg font-semibold border-t pt-4">
            <span>Total</span>
            <span>₦{total.toLocaleString()}</span>
          </div>
        </div>

        {/* Terms & Conditions */}
        <CheckboxField name="terms" label="I agree to the Terms & Conditions" rules={{ required: true }} />

        <SubmitButton className="w-full">Place Order</SubmitButton>
      </FormContextProvider>
    </div>
  );
}