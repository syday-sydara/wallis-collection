"use client";

import { useState } from "react";
import {
  addProductImage,
  deleteProductImage,
  reorderProductImages
} from "@/app/admin/products/actions";

type Image = { id: string; url: string; alt: string | null };

function arrayMove<T>(arr: T[], from: number, to: number) {
  const copy = [...arr];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}

export function ImagesManager({
  productId,
  images
}: {
  productId: string;
  images: Image[];
}) {
  const [localImages, setLocalImages] = useState(images);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleReorder(from: number, to: number) {
    setError(null);
    setReordering(true);
    const previous = localImages;
    const updated = arrayMove(localImages, from, to);
    setLocalImages(updated);

    try {
      await reorderProductImages(
        productId,
        updated.map((i) => i.id)
      );
    } catch {
      setLocalImages(previous);
      setError("Failed to reorder images.");
    } finally {
      setReordering(false);
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    setPendingId(id);
    const previous = localImages;
    setLocalImages((prev) => prev.filter((i) => i.id !== id));

    try {
      await deleteProductImage(id);
    } catch {
      setLocalImages(previous);
      setError("Failed to delete image.");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">Images</h3>

      {error && <p className="text-[11px] text-red-600">{error}</p>}

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
                onClick={() => handleDelete(img.id)}
                disabled={pendingId === img.id}
                className="disabled:opacity-60"
              >
                {pendingId === img.id ? "..." : "Del"}
              </button>
              <div className="flex gap-1">
                <button
                  type="button"
                  disabled={index === 0 || reordering}
                  onClick={() => handleReorder(index, index - 1)}
                  className="disabled:opacity-60"
                >
                  ↑
                </button>
                <button
                  type="button"
                  disabled={index === localImages.length - 1 || reordering}
                  onClick={() => handleReorder(index, index + 1)}
                  className="disabled:opacity-60"
                >
                  ↓
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <form
        action={(formData) => addProductImage(productId, formData)}
        className="mt-2 flex gap-2 text-xs"
      >
        <input
          name="url"
          placeholder="Image URL"
          className="flex-1 rounded border px-2 py-1"
          required
        />
        <input
          name="alt"
          placeholder="Alt text"
          className="w-40 rounded border px-2 py-1"
        />
        <button
          type="submit"
          className="rounded bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white"
        >
          Add
        </button>
      </form>
    </div>
  );
}