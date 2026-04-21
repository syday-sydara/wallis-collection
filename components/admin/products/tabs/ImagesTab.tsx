"use client";

import { useState, useTransition, DragEvent } from "react";
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
  const [uploading, setUploading] = useState(false);
  const [uploadCount, setUploadCount] = useState(0);
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
        await admin.products.images.reorder(
          product.id,
          reordered.map((i) => i.id)
        );
        toast.success("Images reordered");
      } catch {
        toast.error("Failed to reorder images");
      }
    });
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadCount(files.length);

    let success = 0;

    for (const file of Array.from(files)) {
      try {
        await admin.products.images.upload(product.id, file);
        success++;
      } catch {
        // continue
      }
    }

    setUploading(false);

    if (success > 0) {
      toast.success(`Uploaded ${success} image${success > 1 ? "s" : ""}`);
      location.reload();
    } else {
      toast.error("Upload failed");
    }
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  }

  function onDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  return (
    <div className="space-y-4">
      {/* Dropzone + multi-upload */}
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        className="border-2 border-dashed border-border-default rounded-md p-6 text-center cursor-pointer bg-[rgb(var(--surface-muted))]"
        onClick={() => document.getElementById("image-upload-input")?.click()}
      >
        <p className="text-sm text-text-secondary">
          Drag & drop images here, or click to browse
        </p>
        <input
          id="image-upload-input"
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {uploading && (
          <p className="mt-2 text-xs text-text-secondary">
            Uploading {uploadCount} file{uploadCount > 1 ? "s" : ""}…
          </p>
        )}
      </div>

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
