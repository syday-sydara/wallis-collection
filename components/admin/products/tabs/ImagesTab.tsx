"use client";

import admin from "@/lib/admin/client";
import { toast } from "@/components/admin/ui/toast/AdminToastProvider";
import { useTransition } from "react";

export default function ImagesTab({ product }) {
  const [isPending, startTransition] = useTransition();

  async function uploadImage(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    startTransition(async () => {
      try {
        await admin.products.images.upload(product.id, file);
        toast.success("Image uploaded");
        location.reload();
      } catch {
        toast.error("Upload failed");
      }
    });
  }

  async function deleteImage(imageId) {
    startTransition(async () => {
      try {
        await admin.products.images.delete(product.id, imageId);
        toast.success("Image deleted");
        location.reload();
      } catch {
        toast.error("Failed to delete");
      }
    });
  }

  return (
    <div className="space-y-4">
      <input type="file" onChange={uploadImage} />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {product.images.map((img) => (
          <div key={img.id} className="relative group">
            <img
              src={img.url}
              className="w-full h-32 object-cover rounded-md border"
            />

            <button
              onClick={() => deleteImage(img.id)}
              className="absolute top-2 right-2 btn btn-sm btn-danger opacity-0 group-hover:opacity-100 transition"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
