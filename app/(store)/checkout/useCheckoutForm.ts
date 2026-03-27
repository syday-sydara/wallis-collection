// app/(store)/checkout/useCheckoutForm.ts
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { CheckoutPayloadSchema } from "@/lib/checkout/schema";
import { validateExpressAddress } from "@/lib/checkout/shipping";

const ClientSchema = CheckoutPayloadSchema.omit({ items: true });
const STORAGE_KEY = "wallis_checkout_form";

export type CheckoutFormState = z.infer<typeof ClientSchema>;

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
  const errorRefs = useRef<Record<string, HTMLElement | null>>({});

  // Load saved form
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setForm((prev) => ({ ...prev, ...JSON.parse(saved) }));
      } catch {
        // ignore
      }
    }
  }, []);

  // Debounce save
  useEffect(() => {
    setSaving(true);
    const id = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
      setSaving(false);
    }, 300);
    return () => clearTimeout(id);
  }, [form]);

  // Merge client + server errors
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

  // Scroll to first error
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
      setClientErrors((prev) => ({
        ...prev,
        address: [expressError]
      }));
      return false;
    }

    setClientErrors({});
    return true;
  }

  function clearForm() {
    setForm(defaultForm);
    setClientErrors({});
    localStorage.removeItem(STORAGE_KEY);
  }

  return {
    form,
    update,
    validateClient,
    mergedErrors,
    errorRefs,
    saving,
    clearForm
  };
}
