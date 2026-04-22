"use client";

import { useState } from "react";
import { UploadButton } from "./UploadButton";
import { ReplaceImageModal } from "./ReplaceImageModal";
import { DeleteConfirm } from "./DeleteConfirm";
import { Reorder } from "framer-motion";
import Image from "next/image";

export function ImageManager({ productId, initialImages }) {
  const [images, setImages] = useState(initialImages);
  const [replaceImage, setReplaceImage] = useState(null);
  const [deleteImage, setDeleteImage] = useState(null);

  async function handleReorder(newOrder) {
    setImages(newOrder);

    await fetch(`/api/admin/products/${productId}/images/reorder`, {
      method: "POST",
      body: JSON.stringify({ imageIds: newOrder.map((i) => i.id) }),
    });
  }

  async function setPrimary(imageId) {
    await fetch(`/api/admin/products/${productId}/images/set-primary`, {
      method: "POST",
      body: JSON.stringify({ imageId }),
    });

    setImages((prev) =>
      prev.map((img) => ({
        ...img,
        isPrimary: img.id === imageId,
      }))
    );
  }

  return (
    <div className="space-y-6">
      <UploadButton
        productId={productId}
        onUploaded={(img) => setImages((prev) => [...prev, img])}
      />

      <Reorder.Group
        axis="y"
        values={images}
        onReorder={handleReorder}
        className="space-y-4"
      >
        {images.map((img) => (
          <Reorder.Item
            key={img.id}
            value={img}
            className="flex items-center gap-4 p-3 border rounded-md bg-white shadow-sm"
          >
            <Image
              src={img.url}
              alt={img.alt ?? ""}
              width={80}
              height={80}
              className="rounded-md object-cover"
            />

            <div className="flex-1">
              <p className="text-sm font-medium">{img.publicId}</p>
              <p className="text-xs text-gray-500">
                {img.width}×{img.height} • {img.format} • {(img.bytes / 1024).toFixed(1)} KB
              </p>

              {img.isPrimary && (
                <span className="inline-block mt-1 text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                  Primary
                </span>
              )}
            </div>

            <div className="flex gap-2">
              {!img.isPrimary && (
                <button
                  onClick={() => setPrimary(img.id)}
                  className="px-2 py-1 text-xs bg-blue-600 text-white rounded"
                >
                  Set Primary
                </button>
              )}

              <button
                onClick={() => setReplaceImage(img)}
                className="px-2 py-1 text-xs bg-yellow-500 text-white rounded"
              >
                Replace
              </button>

              <button
                onClick={() => setDeleteImage(img)}
                className="px-2 py-1 text-xs bg-red-600 text-white rounded"
              >
                Delete
              </button>
            </div>
          </Reorder.Item>
        ))}
      </Reorder.Group>

      <ReplaceImageModal
        productId={productId}
        image={replaceImage}
        onClose={() => setReplaceImage(null)}
        onReplaced={(updated) =>
          setImages((prev) =>
            prev.map((img) => (img.id === updated.id ? updated : img))
          )
        }
      />

      <DeleteConfirm
        productId={productId}
        image={deleteImage}
        onClose={() => setDeleteImage(null)}
        onDeleted={(id) =>
          setImages((prev) => prev.filter((img) => img.id !== id))
        }
      />
    </div>
  );
}
