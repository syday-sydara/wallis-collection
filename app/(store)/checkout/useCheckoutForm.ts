// app/(store)/checkout/useCheckoutForm.ts
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { CheckoutPayloadSchema } from "@/lib/checkout/schema";
import { validateExpressAddress, getShippingPreview } from "@/lib/checkout/shipping";

// Define the shape of the CheckoutFormState excluding the cart items
const ClientSchema = CheckoutPayloadSchema.omit({ items: true });

const STORAGE_KEY = "wallis_checkout_form"; // LocalStorage key for persisting the form data

export type CheckoutFormState = z.infer<typeof ClientSchema>;

export interface CartItem {
  id: string;
  name: string;
  unitPrice: number;
  quantity: number;
  image?: string;
  variant?: string;
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

  // Load saved form and cart items from localStorage when component mounts
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

  // Save form and cart items to localStorage after changes
  useEffect(() => {
    setSaving(true);
    const id = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ form, cart: cartItems }));
      setSaving(false);
    }, 300);
    return () => clearTimeout(id);
  }, [form, cartItems]);

  // Merge errors from the server and client
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

  // Scroll to the first error when any errors occur
  useEffect(() => {
    const keys = Object.keys(mergedErrors).filter((k) => mergedErrors[k]);
    if (!keys.length) return;
    const first = keys[0];
    const el = errorRefs.current[first];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [mergedErrors]);

  // Update form field value and reset specific error when the user changes the field
  function update<K extends keyof CheckoutFormState>(key: K, value: CheckoutFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setClientErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  // Add an item to the cart or update its quantity if already present
  function addToCart(item: CartItem) {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i));
      }
      return [...prev, item];
    });
  }

  // Remove an item from the cart by its ID
  function removeFromCart(itemId: string) {
    setCartItems((prev) => prev.filter((i) => i.id !== itemId));
  }

  // Update an item's quantity in the cart
  function updateCartItemQuantity(itemId: string, quantity: number) {
    setCartItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, quantity } : i)));
  }

  // Validate the form data (client-side)
  function validateClient() {
    const parsed = ClientSchema.safeParse(form);
    if (!parsed.success) {
      setClientErrors(parsed.error.flatten().fieldErrors);
      return false;
    }

    // Check for express shipping address validity
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

    // Ensure the cart is not empty
    if (cartItems.length === 0) {
      setClientErrors((prev) => ({ ...prev, items: ["Your cart is empty"] }));
      return false;
    }

    setClientErrors({});
    return true;
  }

  // Clear the form and cart (reset state and localStorage)
  function clearForm() {
    setForm(defaultForm);
    setClientErrors({});
    setCartItems([]);
    localStorage.removeItem(STORAGE_KEY);
  }

  // Calculate the total cart value
  const cartTotal = useMemo(() => cartItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0), [cartItems]);

  // Generate the shipping preview (based on the state and cart total)
  const shippingPreview = useMemo(() => getShippingPreview(form.state, form.shippingType), [form, cartTotal]);

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