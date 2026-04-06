"use client";

import { useState } from "react";

type Image = { id?: string; url: string; alt?: string | null };

type Props = { images: Image[] };

export default function Gallery({ images }: Props) {
  if (!images.length) return null;

  const [active, setActive] = useState(images[0].url);
  const activeImage = images.find((img) => img.url === active);

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <img
        src={active}
        alt={activeImage?.alt ?? "Product image"}
        aria-label={activeImage?.alt ?? "Product image"}
        loading="lazy"
        decoding="async"
        className="w-full rounded-lg object-cover aspect-square animate-fadeIn"
      />

      {/* Thumbnails */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none">
        {images.map((img) => {
          const isActive = active === img.url;

          return (
            <button
              key={img.url}
              type="button"
              onClick={() => setActive(img.url)}
              aria-selected={isActive}
              aria-pressed={isActive}
              className={`rounded-md p-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${
                isActive ? "border-2 border-primary" : "border border-border-subtle"
              }`}
            >
              <img
                src={img.url}
                alt={img.alt ?? ""}
                loading="lazy"
                decoding="async"
                className="w-16 h-16 object-cover rounded-md"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}