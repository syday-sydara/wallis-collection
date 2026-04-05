"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createProduct } from "@/app/admin/products/actions";  // Now it's correctly imported

import { AdminField } from "@/components/admin/ui/AdminField";
import { AdminInput } from "@/components/admin/ui/AdminInput";
import { AdminTextarea } from "@/components/admin/ui/AdminTextarea";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { AdminMessage } from "@/components/admin/ui/AdminMessage"; // Correct import

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
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isPending, startTransition] = useTransition();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createProduct(formData);

      if (!result.ok) {
        setErrors(result.errors ?? {});
        return;
      }

      setSuccessMessage("Product created successfully!");
      router.push(`/admin/products/${result.id}`);
    });
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      setImage(e.target.files[0]);
    }
  }

  return (
    <div className="max-w-xl space-y-6">
      <h2 className="text-lg font-semibold text-text tracking-tight">New Product</h2>

      {/* Success Message */}
      {successMessage && (
        <AdminMessage type="success">{successMessage}</AdminMessage>
      )}

      <form
        action={onSubmit}
        method="POST"
        encType="multipart/form-data"
        className="space-y-4 text-sm"
      >
        {/* Product Name */}
        <AdminField label="Name" error={errors.name?.[0]}>
          <AdminInput
            name="name"
            required
            value={name}
            aria-invalid={!!errors.name}
            onChange={(e) => {
              const v = e.target.value;
              setName(v);
              if (!slug) setSlug(slugify(v));
            }}
          />
        </AdminField>

        {/* Slug */}
        <AdminField label="Slug" error={errors.slug?.[0]}>
          <AdminInput
            name="slug"
            required
            value={slug}
            aria-invalid={!!errors.slug}
            onChange={(e) => setSlug(slugify(e.target.value))}
          />
        </AdminField>

        {/* Description */}
        <AdminField label="Description" error={errors.description?.[0]}>
          <AdminTextarea
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />
        </AdminField>

        {/* Base Price */}
        <AdminField label="Base Price (Kobo)" error={errors.basePrice?.[0]}>
          <AdminInput
            name="basePrice"
            type="number"
            required
            value={basePrice}
            aria-invalid={!!errors.basePrice}
            onChange={(e) => setBasePrice(e.target.value)}
          />
        </AdminField>

        {/* Product Image */}
        <AdminField label="Product Image" error={errors.image?.[0]}>
          <input
            type="file"
            name="file"
            accept="image/*"
            onChange={handleImageChange}
            className="block w-full text-sm"
          />
        </AdminField>

        {/* Display form errors */}
        {errors._form && (
          <p className="text-xs text-danger-foreground">{errors._form[0]}</p>
        )}

        {/* Submit Button */}
        <AdminButton type="submit" disabled={isPending}>
          {isPending ? "Saving…" : "Create Product"}
        </AdminButton>
      </form>
    </div>
  );
}