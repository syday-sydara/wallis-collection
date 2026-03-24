"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { useCart } from "@/components/cart/CartProvider";
import type { PaymentMethod } from "@prisma/client"; 

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
  method?: PaymentMethod;
  cardNumber?: string;
  expiry?: string;
  cvv?: string;
}

interface CheckoutContextType {
  shipping: ShippingInfo;
  setShipping: (data: Partial<ShippingInfo>) => void;
  payment: PaymentInfo;
  setPayment: (data: Partial<PaymentInfo>) => void;
  isValidCheckout: () => boolean; // New function for validation
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const [shipping, setShippingState] = useState<ShippingInfo>({
    type: "DELIVERY",
  });

  const [payment, setPaymentState] = useState<PaymentInfo>({});

  const { items } = useCart(); // useful for validation later

  const setShipping = (data: Partial<ShippingInfo>) =>
    setShippingState((prev) => ({ ...prev, ...data }));

  const setPayment = (data: Partial<PaymentInfo>) =>
    setPaymentState((prev) => ({ ...prev, ...data }));

  // Validation logic to ensure cart has items and essential details are filled
  const isValidCheckout = () => {
    if (items.length === 0) {
      return false; // No items in cart
    }

    if (shipping.type === "DELIVERY" && !shipping.address) {
      return false; // Address is required for delivery
    }

    if (!payment.method) {
      return false; // Payment method must be selected
    }

    // Add further validation if necessary (e.g., check card info if payment method is card)

    return true; // All checks passed
  };

  return (
    <CheckoutContext.Provider
      value={{ shipping, setShipping, payment, setPayment, isValidCheckout }}
    >
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout() {
  const ctx = useContext(CheckoutContext);
  if (!ctx) throw new Error("useCheckout must be used inside CheckoutProvider");
  return ctx;
}