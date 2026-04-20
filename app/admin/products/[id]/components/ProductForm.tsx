"use client";

import { useState, useTransition } from "react";

interface ProductFormProps {
  product: {
    id: string;
    name: string;
    slug: string;
    basePrice: number | null;
    description?: string | null;
  };
}

export default function ProductForm({ product }: ProductFormProps) {
  const [name, setName] = useState(product.name);
  const [slug, setSlug] = useState(product.slug);
  const [price, setPrice] = useState(
    product.basePrice ? product.basePrice / 100 : ""
  );
  const [description, setDescription] = useState(product.description || "");

  const [pending, startTransition] = useTransition();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function autoSlug(value: string) {
    setName(value);
    setSlug(
      value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          basePrice: price ? Math.round(Number(price) * 100) : null,
          description,
        }),
      });

      if (!res.ok) throw new Error("Failed to save");

      startTransition(() => {});
    } catch {
      setError("Failed to save changes");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Error */}
      {error && (
        <div className="text-danger text-sm bg-danger/10 p-2 rounded-md">
          {error}
        </div>
      )}

      {/* MOBILE-FIRST STACKED FIELDS */}
      <div className="flex flex-col gap-4 sm:hidden">
        {/* Name */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => autoSlug(e.target.value)}
            className="input"
            placeholder="Product name"
          />
        </div>

        {/* Slug */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Slug</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="input"
            placeholder="product-slug"
          />
        </div>

        {/* Price */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Price (₦)</label>
          <input
            type="number"
            inputMode="decimal"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="input"
            placeholder="0.00"
          />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="input resize-none"
            placeholder="Optional description"
          />
        </div>
      </div>

      {/* DESKTOP TWO-COLUMN LAYOUT */}
      <div className="hidden sm:grid sm:grid-cols-2 sm:gap-6">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => autoSlug(e.target.value)}
            className="input"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Slug</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="input"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Price (₦)</label>
          <input
            type="number"
            inputMode="decimal"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="input"
          />
        </div>

        <div className="flex flex-col gap-1 col-span-2">
          <label className="text-sm font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="input resize-none"
          />
        </div>
      </div>

      {/* Save Button */}
      <button
        type="submit"
        disabled={saving || pending}
        className="btn btn-primary w-full sm:w-auto disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save Changes"}
      </button>
    </form>
  );
}
