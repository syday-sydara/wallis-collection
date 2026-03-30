// app/admin/products/new/page.tsx
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
    <div className="max-w-xl space-y-4">
      <h2 className="text-base font-semibold">New product</h2>
      <form action={onSubmit} className="space-y-3 text-sm">
        <div>
          <label className="block text-xs font-medium">Name</label>
          <input
            name="name"
            required
            value={name}
            onChange={(e) => {
              const v = e.target.value;
              setName(v);
              if (!slug) setSlug(slugify(v));
            }}
            className="mt-1 w-full rounded border px-2 py-1 text-sm"
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-600">{errors.name[0]}</p>
          )}
        </div>
        <div>
          <label className="block text-xs font-medium">Slug</label>
          <input
            name="slug"
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="mt-1 w-full rounded border px-2 py-1 text-sm"
          />
          {errors.slug && (
            <p className="mt-1 text-xs text-red-600">{errors.slug[0]}</p>
          )}
        </div>
        <div>
          <label className="block text-xs font-medium">Base price (kobo)</label>
          <input
            name="basePrice"
            type="number"
            required
            className="mt-1 w-full rounded border px-2 py-1 text-sm"
          />
          {errors.basePrice && (
            <p className="mt-1 text-xs text-red-600">
              {errors.basePrice[0]}
            </p>
          )}
        </div>
        <div>
          <label className="block text-xs font-medium">Description</label>
          <textarea
            name="description"
            className="mt-1 w-full rounded border px-2 py-1 text-sm"
            rows={4}
          />
        </div>
        {errors._form && (
          <p className="text-xs text-red-600">{errors._form[0]}</p>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="rounded bg-black px-3 py-1.5 text-xs font-medium text-white disabled:opacity-60"
        >
          {isPending ? "Saving..." : "Create"}
        </button>
      </form>
    </div>
  );
}
