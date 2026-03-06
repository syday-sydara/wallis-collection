"use client";

import { useState } from "react";
import Image from "next/image";

export default function ProductGallery({ images }: { images: string[] }) {
  const safeImages =
    Array.isArray(images) && images.length > 0
      ? images
      : ["/placeholder.png"];

  const [active, setActive] = useState(safeImages[0]);

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square bg-neutral/20 rounded-xl overflow-hidden">
        <Image
          src={active}
          alt="Product image"
          fill
          priority
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      {/* Thumbnails */}
      <div className="flex gap-3">
        {safeImages.map((img) => {
          const isActive = active === img;

          return (
            <button
              key={img}
              onClick={() => setActive(img)}
              aria-label="Select product image"
              className={`
                relative w-20 h-20 rounded-lg overflow-hidden border transition-all duration-300
                ${isActive ? "border-primary ring-2 ring-primary/30" : "border-neutral hover:border-primary/60"}
              `}
            >
              <Image
                src={img}
                alt="Product thumbnail"
                fill
                className={`object-cover transition-transform duration-300 ${
                  isActive ? "scale-105" : "group-hover:scale-105"
                }`}
                sizes="80px"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
