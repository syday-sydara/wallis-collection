"use client";

import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  ReactNode,
  useCallback,
} from "react";
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
  isValidCheckout: () => boolean;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(
  undefined
);

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const { items } = useCart();

  /* ------------------------------------------------
     State
  ------------------------------------------------ */
  const [shipping, setShippingState] = useState<ShippingInfo>({
    type: "DELIVERY",
  });

  const [payment, setPaymentState] = useState<PaymentInfo>({});

  /* ------------------------------------------------
     Safe merging helpers
  ------------------------------------------------ */
  const setShipping = useCallback(
    (data: Partial<ShippingInfo>) =>
      setShippingState((prev) => ({ ...prev, ...data })),
    []
  );

  const setPayment = useCallback(
    (data: Partial<PaymentInfo>) =>
      setPaymentState((prev) => ({ ...prev, ...data })),
    []
  );

  /* ------------------------------------------------
     Validation
  ------------------------------------------------ */
  const isValidCheckout = useCallback(() => {
    if (items.length === 0) return false;

    if (shipping.type === "DELIVERY") {
      if (!shipping.address || !shipping.city || !shipping.state) {
        return false;
      }
    }

    if (!payment.method) return false;

    return true;
  }, [items, shipping, payment]);

  /* ------------------------------------------------
     Memoized context value
  ------------------------------------------------ */
  const value = useMemo(
    () => ({
      shipping,
      setShipping,
      payment,
      setPayment,
      isValidCheckout,
    }),
    [shipping, payment, setShipping, setPayment, isValidCheckout]
  );

  return (
    <CheckoutContext.Provider value={value}>
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout() {
  const ctx = useContext(CheckoutContext);
  if (!ctx)
    throw new Error("useCheckout must be used inside CheckoutProvider");
  return ctx;
}
