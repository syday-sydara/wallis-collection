"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import admin from "@/lib/admin/client";
import { toast } from "@/components/admin/ui/toast/AdminToastProvider";
import clsx from "clsx";

export default function NewProductForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    basePrice: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  function autoSlug(name: string) {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
  }

  function handleNameChange(value: string) {
    setForm((prev) => ({
      ...prev,
      name: value,
      slug: prev.slug ? prev.slug : autoSlug(value),
    }));
  }

  function validate() {
    const errs: Record<string, string> = {};

    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.slug.trim()) errs.slug = "Slug is required";

    if (form.basePrice === "") {
      errs.basePrice = "Base price is required";
    } else if (Number(form.basePrice) < 0) {
      errs.basePrice = "Price cannot be negative";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    startTransition(async () => {
      try {
        const product = await admin.products.create({
          name: form.name,
          slug: form.slug,
          description: form.description || null,
          basePrice: Math.round(Number(form.basePrice) * 100),
        });

        toast.success("Product created");
        router.push(`/admin/products/${product.id}`);
      } catch {
        toast.error("Failed to create product");
      }
    });
  }

  const disabled = isPending;

  return (
    <form onSubmit={submit} className="space-y-6 max-w-xl">
      {/* Name */}
      <Field
        label="Name"
        error={errors.name}
      >
        <input
          className={clsx("input w-full", errors.name && "input-error")}
          value={form.name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="e.g. Classic T‑Shirt"
          disabled={disabled}
        />
      </Field>

      {/* Slug */}
      <Field
        label="Slug"
        error={errors.slug}
      >
        <input
          className={clsx("input w-full", errors.slug && "input-error")}
          value={form.slug}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, slug: e.target.value }))
          }
          placeholder="e.g. classic-t-shirt"
          disabled={disabled}
        />
      </Field>

      {/* Description */}
      <Field label="Description">
        <textarea
          className="input w-full min-h-[120px]"
          value={form.description}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, description: e.target.value }))
          }
          placeholder="Optional description"
          disabled={disabled}
        />
      </Field>

      {/* Base Price */}
      <Field
        label="Base Price (₦)"
        error={errors.basePrice}
      >
        <input
          type="number"
          className={clsx("input w-full", errors.basePrice && "input-error")}
          value={form.basePrice}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              basePrice: e.target.value,
            }))
          }
          min={0}
          step="0.01"
          disabled={disabled}
        />
      </Field>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => router.back()}
          disabled={disabled}
        >
          Cancel
        </button>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={disabled}
        >
          {isPending ? "Creating…" : "Create Product"}
        </button>
      </div>
    </form>
  );
}

/* -------------------------------------------------- */
/* Field Wrapper                                       */
/* -------------------------------------------------- */

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      {children}
      {error && <p className="text-danger text-xs mt-1">{error}</p>}
    </div>
  );
}
