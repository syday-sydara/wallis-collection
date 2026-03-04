"use client";

import { useState } from "react";
import Image from "next/image";

export default function ProductGallery({
  images,
}: {
  images: string[];
}) {
  const safeImages = Array.isArray(images) && images.length > 0
    ? images
    : ["/placeholder.png"];

  const [active, setActive] = useState(safeImages[0]);

  return (
    <div className="space-y-4">
      <div className="relative aspect-square bg-neutral/20 rounded-xl overflow-hidden">
        <Image
          src={active}
          alt="Product image"
          fill
          className="object-cover"
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      <div className="flex gap-3">
        {safeImages.map((img) => (
          <button
            key={img}
            onClick={() => setActive(img)}
            className={`relative w-20 h-20 rounded-lg overflow-hidden border ${
              active === img
                ? "border-primary"
                : "border-neutral"
            }`}
          >
            <Image
              src={img}
              alt="Product thumbnail"
              fill
              className="object-cover"
              sizes="80px"
            />
          </button>
        ))}
      </div>
    </div>
  );
}