"use client";

import { useState } from "react";

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
      <div className="aspect-square bg-neutral/20 rounded-xl overflow-hidden">
        <img
          src={active}
          alt="Product image"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex gap-3">
        {safeImages.map((img) => (
          <button
            key={img}
            onClick={() => setActive(img)}
            className={`w-20 h-20 rounded-lg overflow-hidden border ${
              active === img
                ? "border-primary"
                : "border-neutral"
            }`}
          >
            <img
              src={img}
              alt=""
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}