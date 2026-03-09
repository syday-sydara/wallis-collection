"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { useCart } from "@/components/cart/cart-context";

type ShippingType = "DELIVERY" | "PICKUP";

interface ShippingInfo {
  type: ShippingType;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  courierPhone?: string;
  trackingNumber?: string;
}

interface PaymentInfo {
  method?: "CARD" | "BANK_TRANSFER";
  cardNumber?: string;
  expiry?: string;
  cvv?: string;
}

interface CheckoutContextType {
  shipping: ShippingInfo;
  setShipping: (data: Partial<ShippingInfo>) => void;
  payment: PaymentInfo;
  setPayment: (data: Partial<PaymentInfo>) => void;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const [shipping, setShippingState] = useState<ShippingInfo>({ type: "DELIVERY" });
  const [payment, setPaymentState] = useState<PaymentInfo>({});
  const { items } = useCart();

  const setShipping = (data: Partial<ShippingInfo>) => setShippingState(prev => ({ ...prev, ...data }));
  const setPayment = (data: Partial<PaymentInfo>) => setPaymentState(prev => ({ ...prev, ...data }));

  return (
    <CheckoutContext.Provider value={{ shipping, setShipping, payment, setPayment }}>
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout() {
  const ctx = useContext(CheckoutContext);
  if (!ctx) throw new Error("useCheckout must be used inside CheckoutProvider");
  return ctx;
}