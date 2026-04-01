"use client";

import { useState } from "react";

type Image = { id?: string; url: string; alt?: string | null };

type Props = { images: Image[] };

export default function Gallery({ images }: Props) {
  const [active, setActive] = useState(images[0]?.url);

  if (!images.length) return null;

  return (
    <div className="space-y-4">
      <img
        src={active}
        alt={images.find((img) => img.url === active)?.alt ?? "Product image"}
        className="w-full rounded-lg object-cover"
      />

      <div className="flex gap-2 overflow-x-auto">
        {images.map((img) => (
          <button
            key={img.url}
            onClick={() => setActive(img.url)}
            className={`border rounded-md focus:outline-none focus:ring-2 ${
              active === img.url ? "border-primary ring-primary" : "border-border-subtle"
            }`}
          >
            <img
              src={img.url}
              alt={img.alt ?? ""}
              className="w-16 h-16 object-cover rounded-md"
            />
          </button>
        ))}
      </div>
    </div>
  );
}