"use client";

import { useState } from "react";

type Image = { id?: string; url: string; alt?: string | null };

type Props = { images: Image[] };

export default function Gallery({ images }: Props) {
  const [active, setActive] = useState(images[0]?.url);

  if (!images.length) return null;

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <img
        src={active}
        alt={images.find((img) => img.url === active)?.alt ?? "Product image"}
        className="w-full rounded-lg object-cover aspect-square animate-fadeIn"
      />

      {/* Thumbnails */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none">
        {images.map((img) => (
          <button
            key={img.url}
            onClick={() => setActive(img.url)}
            aria-selected={active === img.url}
            className={`border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface ${
              active === img.url ? "border-primary" : "border-border-subtle"
            }`}
          >
            <img
              src={img.url}
              alt={img.alt ?? ""}
              className="w-16 h-16 object-cover rounded-md leading-none"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
