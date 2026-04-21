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
  const [progress, setProgress] = useState(0);

  const sensors = useSensors(useSensor(PointerSensor));

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;

    setUploading(true);
    setProgress(0);

    const fileArray = Array.from(files);

    try {
      await admin.products.images.upload(product.id, fileArray);
      toast.success("Images uploaded");
      location.reload();
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  }

  function onDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

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
        toast.error("Failed to reorder");
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        className="border-2 border-dashed border-border-default rounded-md p-6 text-center cursor-pointer bg-[rgb(var(--surface-muted))]"
        onClick={() => document.getElementById("upload-input")?.click()}
      >
        <p className="text-sm text-text-secondary">
          Drag & drop images here, or click to browse
        </p>

        <input
          id="upload-input"
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {uploading && (
          <p className="mt-2 text-xs text-text-secondary">Uploading…</p>
        )}
      </div>

      {/* Sortable grid */}
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
