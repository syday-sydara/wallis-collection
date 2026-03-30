"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { CheckoutPayloadSchema } from "@/lib/checkout/schema";
import { validateExpressAddress, getShippingPreview } from "@/lib/checkout/shipping";

const ClientSchema = CheckoutPayloadSchema.omit({ items: true });
const STORAGE_KEY = "wallis_checkout_form";

export type CheckoutFormState = z.infer<typeof ClientSchema>;

export interface CartItem {
  id: string;
  name: string;
  unitPrice: number;
  quantity: number;
}

export const defaultForm: CheckoutFormState = {
  email: "",
  phone: "",
  fullName: "",
  paymentMethod: "PAYSTACK",
  shippingType: "STANDARD",
  address: "",
  city: "",
  state: ""
};

export function useCheckoutForm(serverErrors: Record<string, string[] | undefined>) {
  const [form, setForm] = useState<CheckoutFormState>(defaultForm);
  const [clientErrors, setClientErrors] = useState<Record<string, string[] | undefined>>({});
  const [saving, setSaving] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const errorRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setForm((prev) => ({ ...prev, ...parsed.form }));
        setCartItems(parsed.cart || []);
      } catch {}
    }
  }, []);

  useEffect(() => {
    setSaving(true);
    const id = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ form, cart: cartItems }));
      setSaving(false);
    }, 300);
    return () => clearTimeout(id);
  }, [form, cartItems]);

  const mergedErrors = useMemo(() => {
    const allKeys = new Set([...Object.keys(clientErrors), ...Object.keys(serverErrors)]);
    const result: Record<string, string | undefined> = {};
    allKeys.forEach((key) => {
      const client = clientErrors[key]?.[0];
      const server = serverErrors[key]?.[0];
      result[key] = client ?? server;
    });
    return result;
  }, [clientErrors, serverErrors]);

  useEffect(() => {
    const keys = Object.keys(mergedErrors).filter((k) => mergedErrors[k]);
    if (!keys.length) return;
    const first = keys[0];
    const el = errorRefs.current[first];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [mergedErrors]);

  function update<K extends keyof CheckoutFormState>(key: K, value: CheckoutFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setClientErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function addToCart(item: CartItem) {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i));
      }
      return [...prev, item];
    });
  }

  function removeFromCart(itemId: string) {
    setCartItems((prev) => prev.filter((i) => i.id !== itemId));
  }

  function updateCartItemQuantity(itemId: string, quantity: number) {
    setCartItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, quantity } : i)));
  }

  function validateClient() {
    const parsed = ClientSchema.safeParse(form);
    if (!parsed.success) {
      setClientErrors(parsed.error.flatten().fieldErrors);
      return false;
    }

    const expressError = validateExpressAddress({
      shippingType: form.shippingType,
      address: form.address,
      city: form.city,
      state: form.state
    });

    if (expressError) {
      setClientErrors((prev) => ({ ...prev, address: [expressError] }));
      return false;
    }

    if (cartItems.length === 0) {
      setClientErrors((prev) => ({ ...prev, items: ["Your cart is empty"] }));
      return false;
    }

    setClientErrors({});
    return true;
  }

  function clearForm() {
    setForm(defaultForm);
    setClientErrors({});
    setCartItems([]);
    localStorage.removeItem(STORAGE_KEY);
  }

  const cartTotal = useMemo(() => cartItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0), [cartItems]);

  const shippingPreview = useMemo(() => getShippingPreview(form, form.shippingType, cartTotal), [form, form.shippingType, cartTotal]);

  return {
    form,
    update,
    cartItems,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    cartTotal,
    shippingPreview,
    validateClient,
    mergedErrors,
    errorRefs,
    saving,
    clearForm
  };
}