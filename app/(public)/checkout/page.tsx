"use client";

import React from "react";
import { useForm } from "react-hook-form";
import {
  FormContextProvider,
  InputField,
  SelectField,
  CheckboxField,
  SubmitButton,
} from "@/components/ui/form";

export default function CheckoutPage() {
  const methods = useForm({ mode: "onChange" });

  const onSubmit = (data: any) => {
    console.log("Form data:", data);
    alert("Order submitted! Check console for data.");
  };

  return (
    <div className="min-h-screen bg-[color:var(--color-bg-primary)] p-8">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      <FormContextProvider methods={methods} onSubmit={onSubmit}>
        <InputField name="fullName" label="Full Name" rules={{ required: "Full name is required" }} />
        <InputField name="email" label="Email" type="email" rules={{ required: "Email is required" }} />
        <SelectField
          name="shipping"
          label="Shipping Option"
          options={[
            { value: "standard", label: "Standard" },
            { value: "express", label: "Express" },
          ]}
          rules={{ required: "Select a shipping option" }}
        />
        <CheckboxField name="terms" label="Accept Terms & Conditions" rules={{ required: true }} />
        <SubmitButton>Place Order</SubmitButton>
      </FormContextProvider>
    </div>
  );
}