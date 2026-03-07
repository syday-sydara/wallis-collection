"use client";

import Image from "next/image";
import { useState } from "react";

export default function ProductGallery({ images }: { images: string[] }) {
  const [selected, setSelected] = useState(0);

  return (
    <div className="space-y-6">
      <div className="relative w-full h-[500px] rounded-xl overflow-hidden bg-neutral/10 group">
        <Image
          key={images[selected]}
          src={images[selected]}
          alt="Product image"
          fill
          priority={selected === 0}
          className="object-cover transition-all duration-500 group-hover:scale-105 opacity-0 animate-fadeIn"
        />
      </div>

      <div className="grid grid-cols-4 gap-4">
        {images.map((img, i) => {
          const isActive = selected === i;
          return (
            <button
              key={i}
              onClick={() => setSelected(i)}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSelected(i)}
              aria-label={`View image ${i + 1}`}
              className={`relative h-24 rounded-lg overflow-hidden border transition-all ${
                isActive ? "border-primary-500" : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <Image src={img} alt="" fill className="object-cover" />
            </button>
          );
        })}
      </div>
    </div>
  );
}