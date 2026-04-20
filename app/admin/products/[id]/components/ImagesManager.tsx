"use client";

import { useState, useTransition } from "react";
import { deleteImage, reorderImages } from "../../actions";
import { AdminCard } from "@/components/admin/ui/AdminCard";
import { SubmitButton } from "@/components/admin/ui/SubmitButton";

export function ImagesManager({ productId, images }) {
  const [items, setItems] = useState(images);
  const [isPending, startTransition] = useTransition();

  function handleDragStart(e, id) {
    e.dataTransfer.setData("id", String(id));
  }

  function handleDrop(e, targetId) {
    const draggedId = e.dataTransfer.getData("id");
    const target = String(targetId);

    const reordered = [...items];
    const from = reordered.findIndex((i) => String(i.id) === draggedId);
    const to = reordered.findIndex((i) => String(i.id) === target);

    if (from === -1 || to === -1 || from === to) return;

    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);

    // Optimistic update
    const previous = items;
    setItems(reordered);

    startTransition(async () => {
      try {
        await reorderImages(
          productId,
          reordered.map((i) => i.id)
        );
      } catch (err) {
        console.error("Reorder failed:", err);
        setItems(previous); // revert
      }
    });
  }

  return (
    <div className={`space-y-3 ${isPending ? "opacity-60 pointer-events-none" : ""}`}>
      {items.map((img) => {
        const filename = img.url.split("/").pop();

        return (
          <AdminCard
            key={img.id}
            draggable={!isPending}
            onDragStart={(e) => handleDragStart(e, img.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, img.id)}
          >
            <div className="flex items-center gap-4">
              <div className="cursor-grab active:cursor-grabbing text-text-muted select-none">
                ⋮⋮
              </div>

              <img
                src={img.url}
                alt={img.alt ?? ""}
                className="h-16 w-16 rounded object-cover"
              />

              <div className="flex-1">
                <p className="text-sm">{filename}</p>
                {img.alt && (
                  <p className="text-xs text-text-muted">Alt: {img.alt}</p>
                )}
              </div>

              <form action={deleteImage.bind(null, productId, img.id)}>
                <SubmitButton
                  variant="danger"
                  size="sm"
                  pendingLabel="Deleting…"
                >
                  Delete
                </SubmitButton>
              </form>
            </div>
          </AdminCard>
        );
      })}
    </div>
  );
}
