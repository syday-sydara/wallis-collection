"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createProduct } from "../actions";

import { AdminField } from "@/components/admin/ui/AdminField";
import { AdminInput } from "@/components/admin/ui/AdminInput";
import { AdminTextarea } from "@/components/admin/ui/AdminTextarea";
import { AdminButton } from "@/components/admin/ui/AdminButton";

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
        <AdminField label="Name" error={errors.name?.[0]}>
          <AdminInput
            name="name"
            required
            value={name}
            onChange={(e) => {
              const v = e.target.value;
              setName(v);
              if (!slug) setSlug(slugify(v));
            }}
          />
        </AdminField>

        <AdminField label="Slug" error={errors.slug?.[0]}>
          <AdminInput
            name="slug"
            required
            value={slug}
            onChange={(e) => setSlug(slugify(e.target.value))}
          />
        </AdminField>

        <AdminField
          label="Base price (kobo)"
          error={errors.basePrice?.[0]}
        >
          <AdminInput name="basePrice" type="number" required />
        </AdminField>

        <AdminField label="Description">
          <AdminTextarea name="description" rows={4} />
        </AdminField>

        {errors._form && (
          <p className="text-xs text-danger-foreground">{errors._form[0]}</p>
        )}

        <AdminButton type="submit" disabled={isPending}>
          {isPending ? "Saving…" : "Create"}
        </AdminButton>
      </form>
    </div>
  );
}