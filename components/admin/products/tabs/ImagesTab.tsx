"use client";

import { useState, useTransition } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import SortableImage from "./SortableImage";
import admin from "@/lib/admin/client";
import { toast } from "@/components/admin/ui/toast/AdminToastProvider";

export default function ImagesTab({ product }) {
  const [images, setImages] = useState(product.images);
  const [isPending, startTransition] = useTransition();

  const sensors = useSensors(useSensor(PointerSensor));

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = images.findIndex((i) => i.id === active.id);
    const newIndex = images.findIndex((i) => i.id === over.id);

    const reordered = arrayMove(images, oldIndex, newIndex);
    setImages(reordered);

    startTransition(async () => {
      try {
        await admin.products.images.reorder(product.id, reordered.map((i) => i.id));
        toast.success("Images reordered");
      } catch {
        toast.error("Failed to reorder images");
      }
    });
  }

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

  return (
    <div className="space-y-4">
      <input type="file" onChange={uploadImage} />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={images.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((img) => (
              <SortableImage key={img.id} image={img} productId={product.id} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
