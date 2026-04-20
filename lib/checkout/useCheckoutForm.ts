"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { CheckoutPayloadSchema } from "@/lib/checkout/schema";
import {
  validateExpressAddress,
  getShippingPreview,
} from "@/lib/checkout/shipping";

/* -------------------------------------------------- */
/* Client-side schema (relaxed vs server)              */
/* -------------------------------------------------- */

const ClientSchema = CheckoutPayloadSchema.omit({
  items: true,
  total: true,
  shippingCost: true,
}).extend({
  // Allow empty string on client; server enforces enum
  state: z.string().min(1, "State is required"),
});

type ClientSchemaType = z.infer<typeof ClientSchema>;

export type CheckoutFormState = ClientSchemaType;

/* -------------------------------------------------- */
/* Cart item type                                      */
/* -------------------------------------------------- */

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

/* -------------------------------------------------- */
/* Defaults                                             */
/* -------------------------------------------------- */

export const defaultForm: CheckoutFormState = {
  email: "",
  phone: "",
  fullName: "",
  paymentMethod: "PAYSTACK",
  shippingType: "STANDARD",
  address: "",
  city: "",
  state: "",
};

const STORAGE_KEY = "wallis_checkout_form";

/* -------------------------------------------------- */
/* Hook                                                 */
/* -------------------------------------------------- */

export function useCheckoutForm(
  serverErrors: Record<string, string[] | undefined>
) {
  const [form, setForm] = useState<CheckoutFormState>(defaultForm);
  const [clientErrors, setClientErrors] = useState<
    Record<string, string[] | undefined>
  >({});
  const [saving, setSaving] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const errorRefs = useRef<Record<string, HTMLElement | null>>({});

  /* -------------------------------------------------- */
  /* Load saved form + cart                              */
  /* -------------------------------------------------- */

  useEffect(() => {
    const saved =
      typeof window !== "undefined"
        ? localStorage.getItem(STORAGE_KEY)
        : null;

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.form) {
          setForm((prev) => ({ ...prev, ...parsed.form }));
        }
        if (Array.isArray(parsed.cart)) {
          setCartItems(parsed.cart);
        }
      } catch {
        // ignore corrupted storage
      }
    }
  }, []);

  /* -------------------------------------------------- */
  /* Persist form + cart                                 */
  /* -------------------------------------------------- */

  useEffect(() => {
    setSaving(true);
    const id = setTimeout(() => {
      if (typeof window !== "undefined") {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ form, cart: cartItems })
        );
      }
      setSaving(false);
    }, 300);
    return () => clearTimeout(id);
  }, [form, cartItems]);

  /* -------------------------------------------------- */
  /* Merge client + server errors                        */
  /* -------------------------------------------------- */

  const mergedErrors = useMemo(() => {
    const allKeys = new Set([
      ...Object.keys(clientErrors),
      ...Object.keys(serverErrors),
    ]);
    const result: Record<string, string | undefined> = {};

    allKeys.forEach((key) => {
      result[key] = clientErrors[key]?.[0] ?? serverErrors[key]?.[0];
    });

    return result;
  }, [clientErrors, serverErrors]);

  /* -------------------------------------------------- */
  /* Scroll to first error                               */
  /* -------------------------------------------------- */

  useEffect(() => {
    const keys = Object.keys(mergedErrors).filter((k) => mergedErrors[k]);
    if (!keys.length) return;

    const el = errorRefs.current[keys[0]];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [mergedErrors]);

  /* -------------------------------------------------- */
  /* Update form field (typed)                           */
  /* -------------------------------------------------- */

  function update<K extends keyof CheckoutFormState>(
    key: K,
    value: CheckoutFormState[K]
  ) {
    const v = typeof value === "string" ? value.trim() : value;
    setForm((prev) => ({ ...prev, [key]: v }));
    setClientErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  /* -------------------------------------------------- */
  /* Cart operations                                     */
  /* -------------------------------------------------- */

  function addToCart(item: CartItem) {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        const newQty = existing.quantity + item.quantity;
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: newQty } : i
        );
      }
      return [...prev, item];
    });
  }

  function removeFromCart(id: string) {
    setCartItems((prev) => prev.filter((i) => i.id !== id));
  }

  function updateCartItemQuantity(id: string, quantity: number) {
    const safeQty = Math.max(1, quantity);
    setCartItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: safeQty } : i))
    );
  }

  /* -------------------------------------------------- */
  /* Client-side validation                              */
  /* -------------------------------------------------- */

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
      state: form.state,
    });

    if (expressError) {
      setClientErrors((prev) => ({ ...prev, address: [expressError] }));
      return false;
    }

    if (cartItems.length === 0) {
      setClientErrors((prev) => ({
        ...prev,
        items: ["Your cart is empty"],
      }));
      return false;
    }

    setClientErrors({});
    return true;
  }

  /* -------------------------------------------------- */
  /* Clear form                                          */
  /* -------------------------------------------------- */

  function clearForm() {
    setForm(defaultForm);
    setClientErrors({});
    setCartItems([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  /* -------------------------------------------------- */
  /* Derived values                                      */
  /* -------------------------------------------------- */

  const cartTotal = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      ),
    [cartItems]
  );

  const shippingPreview = useMemo(
    () => getShippingPreview(form.state, form.shippingType),
    [form.state, form.shippingType]
  );

  /* -------------------------------------------------- */
  /* Return API                                          */
  /* -------------------------------------------------- */

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
    clearForm,
  };
}
