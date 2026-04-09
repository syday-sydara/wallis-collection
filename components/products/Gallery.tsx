"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type ImageType = { id?: string; url: string; alt?: string | null };
type Props = { images: ImageType[] };

export default function Gallery({ images }: Props) {
  if (!images.length) return null;

  const [active, setActive] = useState(images[0].url);
  const activeImage = images.find((img) => img.url === active);

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative w-full aspect-square rounded-lg overflow-hidden animate-fadeIn">
        <Image
          src={active}
          alt={activeImage?.alt ?? "Product image"}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, 50vw"
          priority
        />
      </div>

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
              className={cn(
                "rounded-md p-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
                isActive
                  ? "border-2 border-primary"
                  : "border border-border-subtle"
              )}
            >
              <div className="relative w-16 h-16 rounded-md overflow-hidden">
                <Image
                  src={img.url}
                  alt={img.alt ?? ""}
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-105"
                  sizes="64px"
                  priority={isActive}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}