"use client";

import Image from "next/image";
import { useState } from "react";

export default function ProductGallery({ images }: { images: string[] }) {
  const [selected, setSelected] = useState(0);

  return (
    <div className="space-y-6">
      <div className="relative w-full h-[500px] rounded-xl overflow-hidden bg-neutral/10">
        <Image
          src={images[selected]}
          alt="Product image"
          fill
          className="object-cover"
        />
      </div>

      <div className="grid grid-cols-4 gap-4">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            className={`relative h-24 rounded-lg overflow-hidden border ${
              selected === i
                ? "border-primary"
                : "border-transparent opacity-70 hover:opacity-100"
            }`}
          >
            <Image src={img} alt="" fill className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}