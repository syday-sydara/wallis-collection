"use client";

import { useState } from "react";
import Image from "next/image";

interface ImagesManagerProps {
  productId: string;
  images: { id: string; url: string; alt?: string }[];
}

export default function ImagesManager({ productId, images }: ImagesManagerProps) {
  const [items, setItems] = useState(images);
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch(`/api/admin/products/${productId}/images`, {
        method: "POST",
        body: form,
      });

      if (!res.ok) throw new Error("Upload failed");

      const newImage = await res.json();
      setItems((prev) => [...prev, newImage]);
    } catch {
      alert("Failed to upload image");
    } finally {
      setUploading(false);
    }
  }

  async function deleteImage(id: string) {
    const confirmed = confirm("Delete this image?");
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/products/${productId}/images/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Delete failed");

      setItems((prev) => prev.filter((img) => img.id !== id));
    } catch {
      alert("Failed to delete image");
    }
  }

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      <label className="btn btn-primary w-full sm:w-auto cursor-pointer">
        {uploading ? "Uploading…" : "Upload Image"}
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="hidden"
        />
      </label>

      {/* MOBILE VIEW — stacked cards */}
      <div className="grid gap-4 sm:hidden">
        {items.map((img) => (
          <div
            key={img.id}
            className="card p-3 flex items-center gap-3 active:scale-95 transition-fast"
          >
            <div className="relative w-20 h-20 rounded-md overflow-hidden bg-surface-muted">
              <Image
                src={img.url}
                alt={img.alt || ""}
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>

            <button
              onClick={() => deleteImage(img.id)}
              className="ml-auto text-danger text-sm underline"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {/* DESKTOP VIEW — grid */}
      <div className="hidden sm:grid sm:grid-cols-4 lg:grid-cols-6 gap-4">
        {items.map((img) => (
          <div
            key={img.id}
            className="relative group rounded-md overflow-hidden border border-border bg-surface-card"
          >
            <Image
              src={img.url}
              alt={img.alt || ""}
              width={300}
              height={300}
              className="object-cover w-full h-32"
            />

            <button
              onClick={() => deleteImage(img.id)}
              className="
                absolute top-1 right-1 text-xs px-2 py-1 rounded-md
                bg-danger text-danger-foreground opacity-90
                group-hover:opacity-100 transition
              "
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {uploading && (
        <div className="animate-shimmer bg-skeleton h-4 rounded-md w-1/3" />
      )}
    </div>
  );
}
