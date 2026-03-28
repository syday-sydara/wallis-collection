"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

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
  const [slugEdited, setSlugEdited] = useState(false);

  // FIXED TYPE
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});

  const [isPending, startTransition] = useTransition();

  async function onSubmit(formData: FormData) {
    setErrors({}); // clear old errors

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
        {/* NAME */}
        <div>
          <label className="block text-xs font-medium">Name</label>
          <input
            name="name"
            required
            disabled={isPending}
            value={name}
            onChange={(e) => {
              const v = e.target.value;
              setName(v);

              if (!slugEdited) {
                setSlug(slugify(v));
              }

              setErrors((prev) => ({ ...prev, name: undefined }));
            }}
            className="mt-1 w-full rounded border px-2 py-1 text-sm"
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-600">{errors.name[0]}</p>
          )}
        </div>

        {/* SLUG */}
        <div>
          <label className="block text-xs font-medium">Slug</label>
          <input
            name="slug"
            required
            disabled={isPending}
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugEdited(true);
              setErrors((prev) => ({ ...prev, slug: undefined }));
            }}
            className="mt-1 w-full rounded border px-2 py-1 text-sm"
          />
          {errors.slug && (
            <p className="mt-1 text-xs text-red-600">{errors.slug[0]}</p>
          )}
        </div>

        {/* BASE PRICE */}
        <div>
          <label className="block text-xs font-medium">Base price (kobo)</label>
          <input
            name="basePrice"
            type="number"
            required
            disabled={isPending}
            onChange={() =>
              setErrors((prev) => ({ ...prev, basePrice: undefined }))
            }
            className="mt-1 w-full rounded border px-2 py-1 text-sm"
          />
          {errors.basePrice && (
            <p className="mt-1 text-xs text-red-600">
              {errors.basePrice[0]}
            </p>
          )}
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="block text-xs font-medium">Description</label>
          <textarea
            name="description"
            disabled={isPending}
            className="mt-1 w-full rounded border px-2 py-1 text-sm"
            rows={4}
          />
        </div>

        {/* FORM ERROR */}
        {errors._form && (
          <p className="text-xs text-red-600">{errors._form[0]}</p>
        )}

        {/* SUBMIT */}
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