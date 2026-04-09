"use client";

import { useState } from "react";

type ImageType = { id?: string; url: string; alt?: string | null };
type Props = { images: ImageType[] };
type ImageType = { id?: string; url: string; alt?: string | null };
type Props = { images: ImageType[] };

export default function Gallery({ images }: Props) {
  if (!images.length) return null;

  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const touchStartX = useRef<number | null>(null);

  const activeImage = images[activeIndex];

  /* ---------------- Swipe ---------------- */
  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;

    const delta = e.changedTouches[0].clientX - touchStartX.current;

    if (delta > 50 && activeIndex > 0) {
      setActiveIndex((prev) => prev - 1);
    } else if (delta < -50 && activeIndex < images.length - 1) {
      setActiveIndex((prev) => prev + 1);
    }

    touchStartX.current = null;
  }

  /* ---------------- Keyboard ---------------- */
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowRight" && activeIndex < images.length - 1) {
      setActiveIndex((prev) => prev + 1);
    }
    if (e.key === "ArrowLeft" && activeIndex > 0) {
      setActiveIndex((prev) => prev - 1);
    }
  }

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
              key={img.id ?? img.url}
              type="button"
              onClick={() => {
                setActiveIndex(index);
                setIsLoading(true);
              }}
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

      {/* Zoom Modal */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-modal bg-black/80 flex items-center justify-center"
          onClick={() => setIsZoomed(false)}
        >
          <div className="relative w-full max-w-3xl aspect-square">
            <Image
              src={activeImage.url}
              alt={activeImage.alt ?? ""}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>

          {/* Close hint */}
          <button
            className="absolute top-4 right-4 text-white text-sm"
            onClick={() => setIsZoomed(false)}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}