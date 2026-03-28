"use client";

import { useState, useTransition } from "react";
import {
  addProductImage,
  deleteProductImage,
  reorderProductImages
} from "../action";

export function ImagesManager({
  productId,
  images
}: {
  productId: string;
  images: { id: string; url: string; alt: string | null }[];
}) {
  const [localImages, setLocalImages] = useState(images);
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});

  async function handleReorder(from: number, to: number) {
    const updated = [...localImages];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);

    // optimistic UI
    setLocalImages(updated);

    startTransition(async () => {
      await reorderProductImages(
        productId,
        updated.map((i) => i.id)
      );
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteProductImage(id);
      setLocalImages((prev) => prev.filter((i) => i.id !== id));
    });
  }

  function handleAdd(formData: FormData) {
    setErrors({});

    startTransition(async () => {
      const result = await addProductImage(productId, formData);

      if (!result.ok) {
        setErrors(result.errors ?? {});
        return;
      }

      // Refresh UI optimistically
      const url = formData.get("url") as string;
      const alt = (formData.get("alt") as string) || null;

      setLocalImages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), url, alt }
      ]);
    });
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">Images</h3>

      {/* IMAGE GRID */}
      <div className="flex flex-wrap gap-2">
        {localImages.map((img, index) => (
          <div
            key={img.id}
            className="relative h-24 w-20 overflow-hidden rounded border"
          >
            <img
              src={img.url}
              alt={img.alt ?? ""}
              className="h-full w-full object-cover"
            />

            <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/40 px-1 py-0.5 text-[10px] text-white">
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleDelete(img.id)}
              >
                Del
              </button>

              <div className="flex gap-1">
                <button
                  type="button"
                  disabled={index === 0 || isPending}
                  onClick={() => handleReorder(index, index - 1)}
                >
                  ↑
                </button>
                <button
                  type="button"
                  disabled={index === localImages.length - 1 || isPending}
                  onClick={() => handleReorder(index, index + 1)}
                >
                  ↓
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ADD IMAGE FORM */}
      <form action={handleAdd} className="mt-2 flex gap-2 text-xs">
        <div className="flex-1">
          <input
            name="url"
            placeholder="Image URL"
            className="w-full rounded border px-2 py-1"
            required
          />
          {errors.url && (
            <p className="text-red-600 text-[11px]">{errors.url[0]}</p>
          )}
        </div>

        <input
          name="alt"
          placeholder="Alt text"
          className="w-40 rounded border px-2 py-1"
        />

        <button
          type="submit"
          disabled={isPending}
          className="rounded bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
        >
          {isPending ? "Adding…" : "Add"}
        </button>
      </form>

      {errors._form && (
        <p className="text-red-600 text-[11px]">{errors._form[0]}</p>
      )}
    </div>
  );
}