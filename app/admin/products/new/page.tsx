"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createProduct } from "../actions";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function NewProductPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isPending, startTransition] = useTransition();

  async function onSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createProduct(formData);

      if (!result.ok) {
        setErrors(result.errors ?? {});
        return;
      }

      router.push(`/admin/products/${result.id}`);
    });
  }

  return (
    <div className="max-w-xl space-y-6">
      <h2 className="text-lg font-semibold text-text tracking-tight">
        New product
      </h2>

      <form action={onSubmit} className="space-y-4 text-sm">
        {/* Name */}
        <div>
          <label className="block text-xs font-medium text-text-muted">
            Name
          </label>
          <input
            name="name"
            required
            value={name}
            onChange={(e) => {
              const v = e.target.value;
              setName(v);
              if (!slug) setSlug(slugify(v));
            }}
            className="mt-1 w-full rounded-md border border-border bg-surface px-2 py-1.5 
                       text-text shadow-sm focus:outline-none focus:ring-2 
                       focus:ring-[rgb(var(--focus-ring))]"
          />
          {errors.name && (
            <p className="mt-1 text-xs text-danger-foreground">
              {errors.name[0]}
            </p>
          )}
        </div>

        {/* Slug */}
        <div>
          <label className="block text-xs font-medium text-text-muted">
            Slug
          </label>
          <input
            name="slug"
            required
            value={slug}
            onChange={(e) => setSlug(slugify(e.target.value))}
            className="mt-1 w-full rounded-md border border-border bg-surface px-2 py-1.5 
                       text-text shadow-sm focus:outline-none focus:ring-2 
                       focus:ring-[rgb(var(--focus-ring))]"
          />
          {errors.slug && (
            <p className="mt-1 text-xs text-danger-foreground">
              {errors.slug[0]}
            </p>
          )}
        </div>

        {/* Base Price */}
        <div>
          <label className="block text-xs font-medium text-text-muted">
            Base price (kobo)
          </label>
          <input
            name="basePrice"
            type="number"
            required
            className="mt-1 w-full rounded-md border border-border bg-surface px-2 py-1.5 
                       text-text shadow-sm focus:outline-none focus:ring-2 
                       focus:ring-[rgb(var(--focus-ring))]"
          />
          {errors.basePrice && (
            <p className="mt-1 text-xs text-danger-foreground">
              {errors.basePrice[0]}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-text-muted">
            Description
          </label>
          <textarea
            name="description"
            rows={4}
            className="mt-1 w-full rounded-md border border-border bg-surface px-2 py-1.5 
                       text-text shadow-sm focus:outline-none focus:ring-2 
                       focus:ring-[rgb(var(--focus-ring))]"
          />
        </div>

        {/* Form-level errors */}
        {errors._form && (
          <p className="text-xs text-danger-foreground">{errors._form[0]}</p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-primary px-4 py-2 text-xs font-medium 
                     text-primary-foreground shadow-sm hover:bg-primary-hover 
                     active:bg-primary-active disabled:opacity-60 transition-all"
        >
          {isPending ? "Saving..." : "Create"}
        </button>
      </form>
    </div>
  );
}