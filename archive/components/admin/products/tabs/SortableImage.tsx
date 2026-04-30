"use client";

import { useRef, useTransition } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import admin from "@/lib/admin/client";
import { toast } from "@/components/admin/ui/toast/AdminToastProvider";

export default function SortableImage({ image, productId }) {
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  function replaceImage() {
    fileInputRef.current?.click();
  }

  async function onReplace(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    startTransition(async () => {
      try {
        await admin.products.images.replace(productId, image.id, file);
        toast.success("Image replaced");
        location.reload();
      } catch {
        toast.error("Failed to replace");
      }
    });
  }

  function deleteImage() {
    startTransition(async () => {
      try {
        await admin.products.images.delete(productId, image.id);
        toast.success("Image deleted");
        location.reload();
      } catch {
        toast.error("Failed to delete");
      }
    });
  }

  function setPrimary() {
    startTransition(async () => {
      try {
        await admin.products.images.setPrimary(productId, image.id);
        toast.success("Primary image updated");
        location.reload();
      } catch {
        toast.error("Failed to update primary");
      }
    });
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group border rounded-md overflow-hidden"
    >
      <img
        src={image.url}
        className="w-full h-32 object-cover"
        {...attributes}
        {...listeners}
      />

      {image.isPrimary && (
        <div className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded">
          Primary
        </div>
      )}

      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-2">
        {!image.isPrimary && (
          <button
            onClick={setPrimary}
            className="btn btn-sm btn-success"
            disabled={isPending}
          >
            Set Primary
          </button>
        )}

        <button
          onClick={replaceImage}
          className="btn btn-sm btn-outline"
          disabled={isPending}
        >
          Replace
        </button>

        <button
          onClick={deleteImage}
          className="btn btn-sm btn-danger"
          disabled={isPending}
        >
          Delete
        </button>

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={onReplace}
        />
      </div>
    </div>
  );
}
