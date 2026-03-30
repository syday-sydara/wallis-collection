"use client";

import { useState } from "react";

export default function Gallery({
  images,
}: {
  images: { url: string }[];
}) {
  const [active, setActive] = useState(images[0]?.url);

  return (
    <div className="space-y-4">
      <img
        src={active}
        alt=""
        className="w-full rounded-lg object-cover"
      />

      <div className="flex gap-2">
        {images.map((img) => (
          <button key={img.url} onClick={() => setActive(img.url)}>
            <img
              src={img.url}
              className="w-16 h-16 object-cover rounded-md border border-border-subtle"
              alt=""
            />
          </button>
        ))}
      </div>
    </div>
  );
}